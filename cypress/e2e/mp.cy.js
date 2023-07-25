describe('E2E multiplayer spec', () => {
    before(() => {
        // Start the server before the tests
        cy.exec('node server.js', {failOnNonZeroExit: false, timeout: 20000}).then((result) =>
            console.log(result)
        );
    });

    const getIframeDocument = () => {
        return cy
            .get('iframe[id="player2"]')
            .its('0.contentDocument')
    }

    it('Validate full multiplayer gameplay', () => {
        cy.viewport(1000, 1500)
        // Load the waiting room
        cy.visit('http://localhost:8900/');
        // TODO: should to verify

        // Connect players 1 and 2
        // Create a new iframe
        const iframe = document.createElement('iframe');
        iframe.setAttribute("id", "player2");
        iframe.src = 'http://localhost:8900/';
        // Set the width and height
        iframe.width = '1000';
        iframe.height = '700';

        cy.window().then((parentWindow) => {
            // Open the first page in an iframe
            parentWindow.document.body.appendChild(iframe);
        });
        // TODO: should to verify

        // Send messages
        cy.get('#message').type("GL;HF!");
        cy.get('#send-message').should('have.text', 'Send Message').click();
        cy.frameLoaded('[id="player2"]')
        getIframeDocument().find('#message').type('Thanks, you too!');
        getIframeDocument().find('#send-message').should('have.text', 'Send Message').click();
        // TODO: should to verify

        // Place ships
        const gridPad = 36.1;
        let p1x = 75,p1y = 75
        cy.get('#carrier').click();
        cy.get('#p1div').click(p1x, p1y);

        p1x += gridPad;
        cy.get('#battleship').click();
        cy.get('#p1div').rightclick(p1x, p1y);
        cy.get('#p1div').click(p1x, p1y);

        p1x += gridPad;
        p1y += gridPad * 2;
        cy.get('#destroyer').click();
        cy.get('#p1div').click(p1x, p1y);

        p1x += gridPad * 2;
        p1y += gridPad * 2;
        cy.get('#submarine').click();
        cy.get('#p1div').rightclick(p1x, p1y);
        cy.get('#p1div').click(p1x, p1y);

        p1x += gridPad * 2;
        p1y += gridPad * 2;
        cy.get('#patrolboat').click();
        cy.get('#p1div').click(p1x, p1y);

        let p2x = 75,p2y = 75
        getIframeDocument().find('#carrier').click();
        getIframeDocument().find('#p1div').rightclick(p2x, p2y);
        getIframeDocument().find('#p1div').click(p2x, p2y);

        p2y += gridPad;
        getIframeDocument().find('#battleship').click();
        getIframeDocument().find('#p1div').click(p2x, p2y);

        p2x += gridPad;
        p2y += gridPad * 2;
        getIframeDocument().find('#destroyer').click();
        getIframeDocument().find('#p1div').rightclick(p2x, p2y);
        getIframeDocument().find('#p1div').click(p2x, p2y);

        p2x += gridPad;
        p2y += gridPad * 2;
        getIframeDocument().find('#submarine').click();
        getIframeDocument().find('#p1div').click(p2x, p2y);

        p2x += gridPad;
        p2y += gridPad * 2;
        getIframeDocument().find('#patrolboat').click();
        getIframeDocument().find('#p1div').rightclick(p2x, p2y);
        getIframeDocument().find('#p1div').click(p2x, p2y);

        // Shoot until game ends
        function shootWhileInProgressP1(p1x, p1y, p2x, p2y) {
            let p1turn = false;
            let inProgress = true;

            cy.get('#turn-status').then((turnStatus) => {
                let status = turnStatus.text();
                p1turn = status === "It's your turn!";

                if (p1turn) {
                    cy.get('#p2div').click(p1x, p1y);
                }
            });
            cy.get('#turn-status').then((afterTurnStatus) => {
                inProgress = afterTurnStatus.text() === "Waiting for opponent." || afterTurnStatus.text() === "It's your turn!";

                if (afterTurnStatus.text() === "It's your turn!"){
                    if (inProgress && p1x < 400) {
                        shootWhileInProgressP1(p1x + gridPad, p1y, p2x, p2y)
                    } else if (inProgress && p1y < 398) {
                        shootWhileInProgressP1(75, p1y + gridPad, p2x, p2y)
                    }
                } else {
                    if (inProgress && p2x < 400) {
                        shootWhileInProgressP2(p1x, p1y, p2x + gridPad, p2y)
                    } else if (inProgress&& p2y < 398) {
                        shootWhileInProgressP2(p1x, p1y, 75, p2y + gridPad)
                    }
                }
            });
        }

        function shootWhileInProgressP2(p1x, p1y, p2x, p2y) {
            let p2turn = false;
            let inProgress = true;

            getIframeDocument().find('#turn-status').then((turnStatus) => {
                let status = turnStatus.text();
                inProgress = status === "Waiting for opponent." || status === "It's your turn!";
                p2turn = status === "It's your turn!";

                if (p2turn) {
                    getIframeDocument().find('#p2div').click(p2x, p2y);
                }
                getIframeDocument().find('#turn-status').then((afterTurnStatus) => {
                    inProgress = afterTurnStatus.text() === "Waiting for opponent." || afterTurnStatus.text() === "It's your turn!";

                    if (afterTurnStatus.text() === "It's your turn!"){
                        if (inProgress && p2x < 400) {
                            shootWhileInProgressP2(p1x, p1y, p2x + gridPad, p2y)
                        } else if (inProgress&& p2y < 398) {
                            shootWhileInProgressP2(p1x, p1y, 75, p2y + gridPad)
                        }
                    } else {
                        if (inProgress && p1x < 400 && p2x < 400) {
                            shootWhileInProgressP1(p1x + gridPad, p1y, p2x, p2y)
                        } else if (inProgress && p1y < 398 && p2y < 398) {
                            shootWhileInProgressP1(75, p1y + gridPad, p2x, p2y)
                        }
                    }
                });
            });
        }

        shootWhileInProgressP1(75, 75, 75, 75-gridPad);
        // TODO: should to verify

        // Play again
        cy.get('.btn-leave-game').click();
        getIframeDocument().find('.btn-leave-game').click();
        // TODO: should to verify

        // Player 2 leaves
        cy.window().then((parentWindow) => {
            // Open the first page in an iframe
            parentWindow.document.body.removeChild(iframe);
        });
        // TODO: should to verify

        // Play again on player 1
        cy.get('.btn-leave-game').click();

        // In waiting room
        // TODO: should to verify

    });
})
