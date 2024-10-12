const BASE_URL = "http:localhost:3000";

describe("todos feed", () => {
    it("when loaded, renders the page", () => {
        cy.visit(BASE_URL);
    });

    it("when create new todo, it appears on the screen", () => {
        cy.intercept("POST", `${BASE_URL}/api/todos`, (request) => {
            request.reply({
                statusCode: 201,
                body: {
                    todo: {
                        id: "5550a88a-50ca-448f-bbb0-c1480ee81f23",
                        date: "2023-03-27T00:07:51.718Z",
                        content: "new todo",
                        done: false,
                    }
                }
            });
        }).as("createTodo");

        cy.visit(BASE_URL);

        cy.get("input[name='add-todo']").type("new todo");

        cy.get("btn[aria-label='Adicionar novo item']").click();

        cy.get("table > tbody").contains("new todo");
    });
});