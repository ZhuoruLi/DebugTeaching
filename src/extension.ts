import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "input-display-webview" is now active!');

    let disposable = vscode.commands.registerCommand('input-display-webview.inputData', () => {
        const panel = vscode.window.createWebviewPanel(
            'inputDisplayWebview',
            'Input Display Webview',
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );

        panel.webview.html = getWebviewContent();

        panel.webview.onDidReceiveMessage(
            message => {
				console.log(message);
                switch (message.command) {

                    case 'showInput':
						console.log(message);
                        vscode.window.showInformationMessage(`You entered: ${message.text}`);
                        break;
                }
            },
            undefined,
            context.subscriptions
        );
    });

    context.subscriptions.push(disposable);
}

function getWebviewContent() {
    return `<!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Input Display Webview</title>
    </head>
    <body>
        <input type="text" id="inputBox">
        <button id="submitButton">Submit</button>
        <script>
            const vscode = acquireVsCodeApi();
            document.getElementById("text").addEventListener("click", () => {
                const inputBox = document.getElementById("inputBox") as HTMLInputElement;
                vscode.postMessage({
                    command: 'showInput',
                    text: inputBox.value
                });
            });
        </script>
    </body>
    </html>`;
}
