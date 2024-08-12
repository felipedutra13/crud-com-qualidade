import { HttpNotFoundError } from "@server/infra/errors";

interface TodoRepositoryGetParams {
    page?: number;
    limit?: number;
}

interface TodoRepositoryGetOutput {
    todos: Todo[];
    total: number;
    pages: number;
}

interface Todo {
    id: string;
    content: string;
    date: string;
    done: boolean;
}

function get({
    page,
    limit,
}: TodoRepositoryGetParams = {}): TodoRepositoryGetOutput {
    const currentPage = page || 1;
    const currentLimit = limit || 2;

    const ALL_TODOS = getTodos();

    const startIndex = (currentPage - 1) * currentLimit;
    const endIndex = currentPage * currentLimit;
    const totalPages = Math.ceil(ALL_TODOS.length / limit);

    return {
        todos: ALL_TODOS.slice(startIndex, endIndex),
        total: ALL_TODOS.length,
        pages: totalPages,
    };
}

async function createByContent(content: string): Promise<Todo> {
    const newTodo = create();
    return newTodo;
}

async function toggleDone(id: string): Promise<Todo> {
    const ALL_TODOS = getTodos();

    const todo = ALL_TODOS.find(todo => todo.id === id);

    if (!todo) {
        throw new Error("Todo not found");
    }

    todo.done =!todo.done;
    return todo;
}

async function deleteById(id: string) {
    const ALL_TODOS = getTodos();

    const todo = ALL_TODOS.find(todo => todo.id === id);

    if (!todo) {
        throw new HttpNotFoundError("Todo not found");
    }

    // faz o delete
}

export const todoRepository = {
    get,
    createByContent,
    toggleDone,
    deleteById
};

function create() {
    return {
        id: "5550a88a-50ca-448f-bbb0-c1480ee81f23",
        date: "2023-03-27T00:07:51.718Z",
        content: "Primeira TODO",
        done: false,
    };
}
function getTodos() {
    return [
        {
            id: "5550a88a-50ca-448f-bbb0-c1480ee81f23",
            date: "2023-03-27T00:07:51.718Z",
            content: "Primeira TODO",
            done: false,
        },
        {
            id: "ae800f92-2993-4278-9b1c-917da9c459b7",
            date: "2023-03-27T00:07:51.718Z",
            content: "Atualizada!",
            done: false,
        },
    ];
}
