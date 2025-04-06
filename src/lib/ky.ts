/* eslint-disable @typescript-eslint/no-unsafe-return */
import ky from "ky"

export const kyInstance = ky.create({
  parseJson: (text) =>
    JSON.parse(text, (key, value) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      if (key.endsWith("At")) return new Date(value)

      return value
    }),
})
