import axios from "./axios";

export type IdCodeType = "STUDENT" | "TEACHER" | "COURSE" | "BATCH" | "ENROLLMENT";

export const idCodeApi = {
  async preview(type: IdCodeType): Promise<string> {
    const response = await axios.get<{ code: string }>("/admin/id-codes/preview", {
      params: { type },
    });
    return response.data.code;
  },
};
