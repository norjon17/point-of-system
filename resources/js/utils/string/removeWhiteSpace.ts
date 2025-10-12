export const removeWhiteSpace = (value: string | undefined) => {
    if (!value) return "";

    // value = value ?? "";
    return value.replace(/\s/g, "");
};
