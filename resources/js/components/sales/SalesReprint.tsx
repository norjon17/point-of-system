import {
    ActionIcon,
    Alert,
    Button,
    Group,
    LoadingOverlay,
    Modal,
    Select,
    Stack,
    Tooltip,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";
import { FaPrint } from "react-icons/fa";
import { usePrint } from "../../hooks/print";
import { notifications } from "@mantine/notifications";

interface IProps {
    sales_id: number | null;
    showOnlyDialog?: boolean; // more intuitive name
    openExternal?: boolean; // new prop to externally control dialog
    onCloseExternal?: () => void; // new optional callback
}

const printSizes = [
    { value: "58", label: "58mm" },
    { value: "80", label: "80mm" },
    { value: "210", label: "A4 / 210mm" },
];

export default function SalesReprint({
    sales_id,
    showOnlyDialog,
    openExternal,
    onCloseExternal,
}: IProps) {
    const [openedInternal, { open, close }] = useDisclosure(false);
    const opened = openExternal !== undefined ? openExternal : openedInternal;

    const [loading, setLoading] = useState(false);
    const [selectedSize, setSelectedSize] = useState("58");

    const { print } = usePrint();

    const handlePrint = async () => {
        setLoading(true);

        if (!sales_id) {
            setLoading(false);
            notifications.show({
                title: "Error",
                message: "Sale not found",
                color: "red",
            });
            return;
        }

        const data = await print(sales_id);

        const widthPx =
            selectedSize === "58" ? 300 : selectedSize === "80" ? 480 : 800;

        const printWindow = window.open("", "", `width=${widthPx},height=600`);
        if (printWindow && data) {
            printWindow.document.writeln(`
      <html>
        <head>
          <style>
            @media print {
              @page {
                size: ${selectedSize}mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                font-family: monospace;
                font-size: 12px;
              }
              .receipt {
                padding: 5px 8px;
                width: ${selectedSize}mm;
              }
            }
          </style>
        </head>
        <body>
          <div class="receipt"><pre>${data + "\n".repeat(2)}</pre></div>
        </body>
      </html>
    `);
            printWindow.document.close();
            printWindow.focus();

            printWindow.onload = function () {
                // For preview, leave print disabled
                printWindow.print();
                printWindow.onafterprint = function () {
                    printWindow.close();
                };
            };
        }

        setLoading(false);
        handleClose();
        if (onCloseExternal) {
            onCloseExternal();
        }
    };

    const handleClose = () => {
        if (!loading) {
            close();
        }
    };

    return (
        <>
            {!showOnlyDialog && (
                <Tooltip label="Reprint Receipt?">
                    <ActionIcon color="cyan.8" onClick={open}>
                        <FaPrint size={18} />
                    </ActionIcon>
                </Tooltip>
            )}
            <Modal
                opened={opened}
                onClose={
                    openExternal !== undefined && onCloseExternal
                        ? onCloseExternal
                        : handleClose
                }
                overlayProps={{
                    backgroundOpacity: 0.55,
                    blur: 3,
                }}
            >
                <Stack pos={"relative"}>
                    <LoadingOverlay
                        visible={loading}
                        zIndex={1000}
                        overlayProps={{ radius: "sm", blur: 2 }}
                        loaderProps={{ color: "cyan", type: "bars" }}
                    />
                    <Alert
                        title={!showOnlyDialog ? "Reprint?" : "Print"}
                        color="blue"
                    >
                        Do you want to {!showOnlyDialog ? "reprint?" : "print"}{" "}
                        the receipt?
                    </Alert>
                    <Select
                        label="Paper Width"
                        value={selectedSize}
                        onChange={(val) => val && setSelectedSize(val)}
                        data={printSizes}
                        allowDeselect={false}
                        required
                    />
                    <Group justify="flex-end">
                        <Button onClick={handlePrint}>Yes</Button>
                        <Button
                            variant="outline"
                            onClick={
                                openExternal !== undefined && onCloseExternal
                                    ? onCloseExternal
                                    : handleClose
                            }
                        >
                            Cancel
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </>
    );
}
