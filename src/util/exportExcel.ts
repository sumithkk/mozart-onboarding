import { utils, writeFile } from "xlsx"

export default async (data: any) => {
    const worksheet = utils.json_to_sheet(data)
    const workbook = utils.book_new()
    utils.book_append_sheet(workbook, worksheet, "Exported Data")
    writeFile(workbook, "ExportData.xlsx")
}
