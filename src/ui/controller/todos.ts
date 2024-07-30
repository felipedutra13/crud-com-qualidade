import { todoRepository } from "@ui/repository/todos";
import { z as schema } from "zod";

interface TodoControllerGetParams {
    page: number;
}

interface TodoControllerCreateParams {
    content: string;
    onSuccess: (todo: any) => void;
    onError: () => void;
}

interface Todo {
    id: string;
    content: string;
    date: Date;
    done: boolean;
}



async function get({ page }: TodoControllerGetParams) {
    return todoRepository.get({
        page: page,
        limit: 10,
    });
}

async function create({ content, onSuccess, onError }: TodoControllerCreateParams) {
    const parsedParams = schema.string().nonempty().safeParse(content);
    if (!parsedParams.success) {
        onError();
        return;
    }

    todoRepository.createTodoByContent(parsedParams.data)
        .then(newTodo => {
            onSuccess(newTodo)
        })
        .catch(error => {
            onError();
        });
}

interface TodoControllerToggleDoneParams {
    id: string;
    updateTodoOnScreen: () => void;
    onError: () => void;
}
function toggleDone({ id, onError, updateTodoOnScreen }: TodoControllerToggleDoneParams) {
    todoRepository
        .toggleDone(id)
        .then(() => {
            updateTodoOnScreen();
        })
        .catch(() => {
            onerror();
        });
}

function filterTodosByContent<Todo>(search: string, todos: Array<Todo & { content: string }>): Array<Todo> {
    const homeTodos = todos.filter(todo => {
        const searchNormalized = search.toLowerCase();
        const contentNormalized = todo.content.toLowerCase();
        return contentNormalized.includes(searchNormalized);
    });

    return homeTodos;
}

export const todoController = {
    get,
    filterTodosByContent,
    create,
    toggleDone,
};
