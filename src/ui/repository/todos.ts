import { Todo, TodoSchema } from "@ui/schema/todo";
import { z as schema } from "zod";

interface TodoRepositoryGetParams {
    page: number;
    limit: number;
}
interface TodoRepositoryGetOutput {
    todos: Todo[];
    total: number;
    pages: number;
}

function get({
    page,
    limit,
}: TodoRepositoryGetParams): Promise<TodoRepositoryGetOutput> {
    return fetch(`/api/todos?page=${page}&limit=${limit}`).then(
        async (response) => {
            const responseFromServer = parseResponseFromServer(
                JSON.parse(await response.text())
            );

            console.log("server:", page, limit, JSON.stringify(responseFromServer))

            return {
                todos: responseFromServer.todos,
                total: responseFromServer.total,
                pages: responseFromServer.pages,
            };
        }
    );
}

async function createTodoByContent(content: string): Promise<Todo> {

    const response = await fetch("/api/todos", {
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            content,
        })
    });

    if (response.ok) {
        const serverResponse = await response.json();

        const ServerResponseSchema = schema.object({
            todo: TodoSchema,
        });

        const serverResponseParsed = ServerResponseSchema.safeParse(serverResponse);

        if (!serverResponseParsed.success) {
            throw new Error("Failed to create TODO!");
        }

        const todo = serverResponseParsed.data.todo;
        return todo;
    }

    throw new Error("Failed to create TODO!");

}

async function toggleDone(todoId: string): Promise<Todo> {
    const response = await fetch(`/api/todos/${todoId}/toogle-done`, {
        method: "PUT"
    });

    if (response.ok) {
        const serverResponse = await response.json();

        const ServerResponseSchema = schema.object({
            todo: TodoSchema,
        });

        const serverResponseParsed = ServerResponseSchema.safeParse(serverResponse);

        if (!serverResponseParsed.success) {
            throw new Error("Failed to update TODO!");
        }

        const todo = serverResponseParsed.data.todo;
        return todo;
    }

    throw new Error("Failed to update TODO!");
}

function parseResponseFromServer(responseBody: unknown): {
    total: number;
    pages: number;
    todos: Array<Todo>;
} {
    console.log("body", responseBody)
    if (
        responseBody !== null &&
        typeof responseBody === "object" &&
        "todos" in responseBody &&
        "total" in responseBody &&
        "pages" in responseBody &&
        Array.isArray(responseBody)
    ) {
        return {
            total: Number(responseBody.total),
            pages: Number(responseBody.pages),
            todos: responseBody.map((todo: unknown) => {
                if (todo === null && typeof todo !== "object") {
                    throw new Error("Invalid todo from server!");
                }

                const { id, content, date, done } = todo as {
                    id: string;
                    content: string;
                    date: string;
                    done: string;
                };

                return {
                    id: id,
                    content: content,
                    date: date,
                    done: String(done).toLocaleLowerCase() === "true",
                };
            }),
        };
    }

    return {
        total: 0,
        pages: 1,
        todos: [],
    };
}

export const todoRepository = {
    get,
    createTodoByContent,
    toggleDone,
};
