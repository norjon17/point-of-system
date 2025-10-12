import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import {
    Alert,
    Button,
    Card,
    Flex,
    Group,
    PasswordInput,
    Title,
    rem,
} from "@mantine/core";
import { BREAKPOINTS, DEF_MSG } from "../../constants/constants";
import { useMediaQuery } from "@mantine/hooks";
import { PasswordResetType } from "../../types";
import { useAuth } from "../../hooks/auth";

export default function PasswordReset() {
    const [disabled, setDisabled] = useState(false);
    const { updatePassword } = useAuth();
    const mediaLG = useMediaQuery(`(max-width: ${BREAKPOINTS.lg}px)`);
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PasswordResetType>({
        defaultValues: defaultFormValue(),
    });

    const onSubmit: SubmitHandler<PasswordResetType> = async (data) => {
        // setFormMsg(null);
        setDisabled(true);
        await updatePassword(data);
        setDisabled(false);
        reset();
    };

    return (
        <Card shadow="sm" withBorder radius="md" w={mediaLG ? "100%" : "50%"}>
            <Title order={3}>Password Update</Title>
            <Flex
                component={"form"}
                id="passwordresetform"
                onSubmit={handleSubmit(onSubmit)}
                direction={"column"}
                gap={rem(10)}
                mt={rem(10)}
            >
                <Alert color="cyan" title="Note">
                    Your password can be used in our in-house applications
                    developed from FY23 onwards.
                </Alert>
                <PasswordInput
                    type="password"
                    label="Current Password"
                    {...register("current_password", {
                        required: DEF_MSG.REQUIRED,
                    })}
                    disabled={disabled}
                    withAsterisk
                    error={errors.current_password?.message}
                    placeholder="Enter your current password"
                />
                <PasswordInput
                    type="password"
                    label="New Password"
                    error={errors.new_password?.message}
                    {...register("new_password", {
                        required: DEF_MSG.REQUIRED,
                    })}
                    disabled={disabled}
                    withAsterisk
                    placeholder="Enter your new password"
                />
                <PasswordInput
                    type="password"
                    label="Confirm Password"
                    error={errors.confirm_password?.message}
                    {...register("confirm_password", {
                        required: DEF_MSG.REQUIRED,
                    })}
                    disabled={disabled}
                    withAsterisk
                    placeholder="Confirm your new password"
                />
            </Flex>
            <Group justify="flex-end" mt={rem(10)}>
                <Button
                    type="submit"
                    form="passwordresetform"
                    disabled={disabled}
                    loading={disabled}
                >
                    Update
                </Button>
            </Group>
        </Card>
    );
}

const defaultFormValue = (): PasswordResetType => ({
    current_password: "",
    new_password: "",
    confirm_password: "",
});
