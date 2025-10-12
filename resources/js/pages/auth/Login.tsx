import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { LINKS } from "../../routes";
import { useNavigate } from "react-router";
import {
    BREAKPOINTS,
    DEF_MSG,
    LocalStorageName,
    WEB_APP_NAME,
} from "../../constants/constants";
import { Navigate } from "react-router";
import {
    Alert,
    Button,
    Card,
    Group,
    PasswordInput,
    Stack,
    Box,
    TextInput,
    Text,
    getGradient,
    useMantineTheme,
    Loader,
    Image,
} from "@mantine/core";
import { FaEnvelope, FaExclamationCircle, FaKey } from "react-icons/fa";
import { useMutation } from "@tanstack/react-query";
// import { useAppVersion } from "../../states/version";
import { useMediaQuery } from "@mantine/hooks";
import { useAuth } from "../../hooks/auth";
import { LoginType } from "../../types";

// Page for rendering login form
export default function Login() {
    const mediaLG = useMediaQuery(`(max-width: ${BREAKPOINTS.lg}px)`);

    // const { data: appVersion } = useAppVersion();
    // State hooks to manage button state and error message
    const [errMsg, setErrMsg] = useState<string | null>(null);

    const { user, userLoading, refetchUser, userFetchingLoading, login } =
        useAuth();
    const navigate = useNavigate();
    const [bgColor] = useState(
        getGradient(
            { deg: 180, from: "myprimary.0", to: "myprimary.2" },
            useMantineTheme()
        )
    );

    // Initialize form with default values
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        control,
    } = useForm<LoginType>({ defaultValues: defaultLoginValues() });

    const { mutateAsync: loginMutate, isPending } = useMutation({
        mutationFn: login,
        onSuccess: async () => {
            await refetchUser();
            const landingPage = localStorage.getItem(
                LocalStorageName.initialLandingPage
            );
            if (landingPage) {
                navigate(landingPage);
                localStorage.removeItem(LocalStorageName.initialLandingPage);
            } else {
                navigate(LINKS.HOME);
            }

            // queryClient.setQueryData([QUERY_NAME.USER], e);
            // queryClient.invalidateQueries({ queryKey: ["user"] });
        },
        onError: (e) => {
            // console.error(e.message);
            setErrMsg(e.message);
        },
    });

    // Function to handle form submission
    const onSubmit = async (data: LoginType) => {
        setErrMsg(null);
        try {
            loginMutate(data);
        } catch (e: Error | any) {
            // Handle error and set error message
            const error = e;
            console.error(error);
            setValue("password", "");
            if (error.response && error.response.data) {
                setErrMsg(error.response.data);
            }
        }
    };

    return (
        <>
            {!userLoading ? (
                !user ? (
                    <Box
                        style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: "100vh",
                        }}
                        bg={bgColor}
                    >
                        <Card
                            shadow="sm"
                            withBorder
                            radius="md"
                            component="form"
                            onSubmit={handleSubmit(onSubmit)}
                            noValidate
                            w={mediaLG ? "90%" : 400}
                            style={{
                                background: "rgba(255, 255, 255, 0.5)", // Transparent white
                                backdropFilter: "blur(10px)", // Apply blur effect
                            }}
                        >
                            <Stack>
                                {/* <Title size="h3" ta={"center"}>
                  iTApp
                </Title> */}
                                <Stack align="center">
                                    <Image
                                        src="/assets/images/logo.png"
                                        w={200}
                                        alt="Logo"
                                    />
                                    <Text mt={"-sm"}>{WEB_APP_NAME}</Text>
                                </Stack>

                                {/* Display error message if there is one */}
                                {errMsg && (
                                    <Alert
                                        variant="light"
                                        color="red"
                                        title={errMsg}
                                        icon={<FaExclamationCircle />}
                                    />
                                )}

                                <TextInput
                                    label="User name"
                                    type="username"
                                    placeholder="Enter your user name"
                                    error={errors.username?.message}
                                    disabled={isPending || userFetchingLoading}
                                    {...register("username", {
                                        required: DEF_MSG.REQUIRED,
                                    })}
                                    required
                                    leftSection={<FaEnvelope />}
                                    styles={{
                                        input: {
                                            background: "transparent",
                                        },
                                    }}
                                />

                                {/* Controller to handle password input */}
                                <Controller
                                    control={control}
                                    name="password"
                                    rules={{
                                        required: DEF_MSG.REQUIRED,
                                    }}
                                    render={({
                                        field: { value, onChange },
                                    }) => (
                                        <PasswordInput
                                            label="Password"
                                            placeholder="Enter your password"
                                            value={value}
                                            onChange={onChange}
                                            disabled={
                                                isPending || userFetchingLoading
                                            }
                                            error={errors.password?.message}
                                            required
                                            leftSection={<FaKey />}
                                            styles={{
                                                input: {
                                                    background: "transparent",
                                                },
                                            }}
                                        />
                                    )}
                                />
                                <Group justify="flex-end">
                                    <Button
                                        type="submit"
                                        loading={
                                            isPending || userFetchingLoading
                                        }
                                        disabled={
                                            isPending || userFetchingLoading
                                        }
                                    >
                                        Login
                                    </Button>
                                </Group>
                            </Stack>
                        </Card>
                        {/* {appVersion && (
                            <Text
                                c={"white"}
                                fz={12}
                                style={{
                                    position: "fixed",
                                    bottom: 10,
                                    right: 10,
                                }}
                            >
                                {appVersion.version}
                            </Text>
                        )} */}
                    </Box>
                ) : (
                    <Navigate to={LINKS.HOME} />
                )
            ) : (
                <Box
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                    }}
                >
                    <Loader />
                </Box>
            )}
        </>
    );
}

const defaultLoginValues = () => ({
    email: "",
    password: "",
    remember_me: false,
});
