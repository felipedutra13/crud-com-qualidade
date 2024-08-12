import { todoRepository } from "@server/repository/todos";
import { z as schema } from "zod";
import { NextApiRequest, NextApiResponse } from "next";
import { HttpNotFoundError } from "@server/infra/errors";

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

    console.log("output", output);

    res.status(200).json({
        todos: output.todos,
        total: output.total,
        pages: output.pages,
    });

    return res;
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

async function deleteById(req: NextApiRequest, res: NextApiResponse) {
    // validate schema
    const QuerySchema = schema.object({
        id: schema.string().uuid().nonempty(),
    });

    const parsedQuery = QuerySchema.safeParse(req.query);

    if (!parsedQuery.success) {
        res.status(400).json({
            message: "You must provide a valid id!"
        });
        return;
    }

    try {
        const todoId = parsedQuery.data.id;
        await todoRepository.deleteById(todoId);
        res.status(204).end();
    } catch (err) {
        if (err instanceof HttpNotFoundError) {
            res.status(err.status).json({
                message: err.message
            });
            return;
        }

        res.status(500).json({
            message: "Internal server error!"
        });
    }
}

export const todoController = {
    get,
    create,
    toggleDone,
    deleteById
};
