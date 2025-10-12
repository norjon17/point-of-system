import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import { LINKS } from "../../routes";

export default function AccessDenied() {
    const navigate = useNavigate();

    const goToHome = () => {
        navigate(LINKS.HOME);
    };

    return (
        <Center>
            <Stack align="center" mt={100}>
                <Title
                    style={{ fontSize: 60, fontWeight: 900, color: "#FF6B6B" }}
                >
                    401
                </Title>
                <Title order={4}>Access Denied</Title>
                <Text c="dimmed">You do not have access to this page.</Text>
                <Group justify="center">
                    <Button variant="outline" onClick={goToHome}>
                        Go to Home
                    </Button>
                </Group>
            </Stack>
        </Center>
    );
}
