import { createTheme } from "@mantine/core"

export const mantineTheme = createTheme({
  primaryColor: "myprimary",
  primaryShade: 7,
  headings: {
    fontFamily: "Helvetica, sans-serif",
  },
  colors: {
    myprimary: [
      "#e1f8ff",
      "#cbedff",
      "#9ad7ff",
      "#64c1ff",
      "#3aaefe",
      "#20a2fe",
      "#099cff",
      "#0088e4",
      "#0079cd",
      "#0068b6",
    ],
  },
  // components: {
  //   Button: {
  //     defaultProps: {
  //       color: "darkBlue",
  //     },
  //   },
  //   // ActionIcon: {
  //   //   defaultProps: {
  //   //     color: "darkGreen",
  //   //   },
  //   // },
  // },
})
