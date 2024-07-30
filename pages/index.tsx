import React, { useEffect, useState, useRef } from "react";
import { GlobalStyles } from "@ui/theme/GlobalStyle";
import { todoController } from "@ui/controller/todos";

const bg = "/bg.jpeg";

interface HomeTodo {
    id: string;
    content: string;
    // date: string;
    done: boolean;
}

function HomePage() {
    const initialLoad = useRef(false);
    const [newTodoContent, setNewTodoContent] = useState("");
    const [totalPages, setTotalPages] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [todos, setTodos] = useState<HomeTodo[]>([]);
    const hasMorePages = totalPages > page;

    const homeTodos = todoController.filterTodosByContent<HomeTodo>(search, todos);

    const hasNoTodos = homeTodos.length === 0 && !isLoading;

    useEffect(() => {
        if (!initialLoad.current) {
            todoController.get({ page }).then(({ todos, pages }) => {
                setTodos(todos);
                setTotalPages(pages);
            }).finally(() => initialLoad.current = true);
        }
    }, []);

    return (
        <main>
            <GlobalStyles />
            <header
                style={{
                    backgroundImage: `url('${bg}')`,
                }}
            >
                <div className="typewriter">
                    <h1>O que fazer hoje?</h1>
                </div>
                <form onSubmit={() => {
                    // preventdefault
                    todoController.create({
                        content: newTodoContent,
                        onSuccess(todo: HomeTodo) {
                            setTodos((oldTodos) => {
                                return [todo, ...oldTodos];
                            });
                            setNewTodoContent("");
                        },
                        onError() {
                            alert("Necessário conteúdo para criar uma TODO!");
                        }
                    });
                }}>
                    <input type="text" placeholder="Correr, Estudar..." value={newTodoContent} onChange={(event) => {
                        setNewTodoContent(event.target.value);
                    }} />
                    <button type="submit" aria-label="Adicionar novo item">
                        +
                    </button>
                </form>
            </header>

            <section>
                <form>
                    <input
                        type="text"
                        placeholder="Filtrar lista atual, ex: Dentista"
                        onChange={(event) => {
                            setSearch(event.target.value);
                        }}
                    />
                </form>

                <table border={1}>
                    <thead>
                        <tr>
                            <th align="left">
                                <input type="checkbox" disabled />
                            </th>
                            <th align="left">Id</th>
                            <th align="left">Conteúdo</th>
                            <th />
                        </tr>
                    </thead>

                    <tbody>
                        {homeTodos.map((todo) => {
                            return (
                                <tr key={todo.id}>
                                    <td>
                                        <input type="checkbox"
                                            defaultChecked={todo.done}
                                            onChange={() => {
                                                todoController.toggleDone({
                                                    id: todo.id,
                                                    onError: () => {
                                                        alert("Falha ao atualizar TODO!")
                                                    },
                                                    updateTodoOnScreen: () => {
                                                        setTodos(currentTodos => {
                                                            return currentTodos.map(currentTodo => {
                                                                if (currentTodo.id === todo.id) {
                                                                    return {
                                                                        ...currentTodo,
                                                                        done: !currentTodo.done
                                                                    };
                                                                }
                                                                return currentTodo;
                                                            })
                                                        })
                                                    }
                                                });
                                            }} />
                                    </td>
                                    <td>{todo.id.substr(0, 4)}</td>
                                    <td>
                                        {todo.done && todo.content}
                                        {!todo.done && <s>todo.content</s>}
                                    </td>
                                    <td align="right">
                                        <button data-type="delete">
                                            Apagar
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}

                        {isLoading && (<tr>
                            <td
                                colSpan={4}
                                align="center"
                                style={{ textAlign: "center" }}
                            >
                                Carregando...
                            </td>
                        </tr>)}

                        {hasNoTodos && (<tr>
                            <td colSpan={4} align="center">
                                Nenhum item encontrado
                            </td>
                        </tr>)}

                        {hasMorePages ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    align="center"
                                    style={{ textAlign: "center" }}
                                >
                                    <button
                                        data-type="load-more"
                                        onClick={() => {
                                            setIsLoading(true);
                                            const nextPage = page + 1;
                                            setPage(nextPage);

                                            todoController.get({ page: nextPage }).then(({ todos, pages }) => {
                                                setTodos(todos);
                                                // setTodos((oldTodos) => [...oldTodos, ...todos]);
                                                setTotalPages(pages);
                                            }).finally(() => setIsLoading(false));
                                        }}
                                    >
                                        Página {page}, Carregar mais{" "}
                                        <span
                                            style={{
                                                display: "inline-block",
                                                marginLeft: "4px",
                                                fontSize: "1.2em",
                                            }}
                                        >
                                            ↓
                                        </span>
                                    </button>
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </section>
        </main>
    );
}

export default HomePage;
