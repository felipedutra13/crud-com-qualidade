import { todoRepository } from "@server/repository/todos";
import { z as schema } from "zod";
import { NextApiRequest, NextApiResponse } from "next";

async function get(req: NextApiRequest, res: NextApiResponse) {
    const page = Number(req.query.page);
    const limit = Number(req.query.limit);

    if ((page && isNaN(page)) || (limit && isNaN(limit))) {
        res.status(400).json({ error: "Invalid page/limit number!" });
        return;
    }

    const output = todoRepository.get({
        page,
        limit,
    });

    res.status(200).json({
        todos: output.todos,
        total: output.total,
        pages: output.pages,
    });
}

const TodoCreateBodySchema = schema.object({
    content: schema.string(),
});

async function create(req: NextApiRequest, res: NextApiResponse) {
    const body = TodoCreateBodySchema.safeParse(req.body);

    if (!body.success) {
        res.status(400).json({
            error: {
                message: "Provide a valid content to create a TODO!",
                description: body.error.issues
            }
        });
        return;
    }

    const createdTodo = await todoRepository.createByContent(body.data.content);
    res.status(201).json(createdTodo);
}

async function toggleDone(req: NextApiRequest, res: NextApiResponse) {
    const todoId = req.query.id;

    if (!todoId || typeof todoId !== "string") {
        res.status(404).json({
            message: "You must provide a todoId parameter"
        });

        return;
    }

    try {
        const updatedTodo = await todoRepository.toggleDone(todoId);

        res.status(200).json({
            todo: updatedTodo
        });
    } catch (err) {
        res.status(404).json({
            message: err.message
        });
    }
}

export const todoController = {
    get,
    create,
    toggleDone,
};
