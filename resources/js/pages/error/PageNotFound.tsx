import { Button, Center, Group, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "react-router";
import { LINKS } from "../../routes";

export default function PageNotFound() {
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
                    404
                </Title>
                <Title order={4}>Page Not Found</Title>
                <Text c="dimmed">
                    The page you are looking for might have been removed, had
                    its name changed, or is temporarily unavailable.
                </Text>
                <Group justify="center">
                    <Button variant="outline" onClick={goToHome}>
                        Go to Home
                    </Button>
                </Group>
            </Stack>
        </Center>
    );
}
