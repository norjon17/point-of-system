import { useMediaQuery } from "@mantine/hooks";
import { BREAKPOINTS } from "../constants/constants";

export const useMedia = () => {
    const mediaMinXS = useMediaQuery(`(min-width: ${BREAKPOINTS.xs})`);
    const mediaMinSM = useMediaQuery(`(min-width: ${BREAKPOINTS.sm})`);
    const mediaMinMD = useMediaQuery(`(min-width: ${BREAKPOINTS.md})`);
    const mediaMinLG = useMediaQuery(`(min-width: ${BREAKPOINTS.lg})`);

    return { mediaMinXS, mediaMinSM, mediaMinMD, mediaMinLG };
};
