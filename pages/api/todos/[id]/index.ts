import { NextApiRequest, NextApiResponse } from "next";
import { todoController } from "@server/controller/todos";

export default function handler(
    request: NextApiRequest,
    response: NextApiResponse
) {
    if (request.method === "DELETE") {
        todoController.deleteById(request, response);
        response.status(200).json({ message: "Toggle-Done!" });
        return;
    }

    response.status(405);
}
