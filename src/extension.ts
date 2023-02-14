import * as vscode from 'vscode';
let behaviorData: string[] = [];
//let panel: vscode.WebviewPanel | undefined;
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
                switch (message.command) {

                    case 'showInput':
						
                        vscode.window.showInformationMessage(`You entered: ${message.text}`);
                        behaviorData.push("Question: "+message.text+"?");
                        break;
                    case 'behaviorInfo1':
                        vscode.window.showInformationMessage(`Line edit: ${message.info}`);
                        break;
                    case 'behaviorInfo2':
                        vscode.window.showInformationMessage(`User behavior: ${message.info}`);
                    case 'saveData':
                        saveData();
                        break;
                
                }
            },
            undefined,
            context.subscriptions
        );
        
        // vscode.workspace.onDidChangeTextDocument(event => {
        //     if (panel) {
        //         const behavior = `Text changed: ${event.document.getText()}`;
        //         panel.webview.postMessage({
        //           command: 'behaviorInfo',
        //           info: behavior
        //         });
        //     }
            
        // });
        let toprint:string  = "";
        let currentline:number = -1;
        vscode.workspace.onDidChangeTextDocument(event => {
            if (panel) {
                const line = event.contentChanges[0].range.start.line;
                //when change the line, print what changes to the new line, 
                //also store the current string;
                if (currentline !== line) {
                    behaviorData.push("Line " + currentline + " changed: "+toprint);

                    toprint = "";
                    currentline = line;
                }
                toprint += event.contentChanges[0].text;
                const behavior = `Line ${line} changed: "${toprint}"`;
                panel.webview.postMessage({
                  command: 'behaviorInfo1',
                  info: behavior
                });
            }
        });

        vscode.languages.registerCodeActionsProvider("*", {
            provideCodeActions(document, range, context, token) {
                const behavior = `Code action performed: ${context.diagnostics[0].message}`;
                
                panel.webview.postMessage({
                  command: 'behaviorInfo2',
                  info: behavior
                });
                return [];
            }
        });



    });

    context.subscriptions.push(disposable);
    

}

async function saveData() {
    if (!vscode.workspace.workspaceFolders) {
      vscode.window.showErrorMessage("No workspace folder is opened in VS Code.");
      return;
    }
  
    const filePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'behavior-track.txt');
    const content = behaviorData.join("\n");
  
    try {
      await vscode.workspace.fs.writeFile(filePath, Buffer.from(content, 'utf8'));
      vscode.window.showInformationMessage("Behavior track data saved to file: behavior-track.txt");
    } catch (error) {
      vscode.window.showErrorMessage(`Failed to save behavior track data: ${error}`);
    }
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
        <div id="msg">
            <pre></pre>
        </div>
        <div id="behavior-info1">
        </div>
        <div id="behavior-info2">
        </div>

        <button id="storeButton">Store</button>
        <script>
            let questions = [];
            function addQuestion() {
                const question = document.getElementById('inputBox').value;
                questions.push(question);
                let pre = document.querySelector('#msg pre');
                pre.textContent = JSON.stringify(questions, '\t', 2);
                vscode.postMessage({
                    command: 'showInput',
                    text:  question
                })

            }
            function storeChanges() {
                vscode.postMessage({
                    command: 'saveData' 
                });
            }
            const vscode = acquireVsCodeApi();
            document.getElementById('submitButton').addEventListener("click", addQuestion);
            document.getElementById('storeButton').addEventListener("click", storeChanges);
            window.addEventListener('message', (event) => {
                const message = event.data; // The message data is contained in the event data property
                switch (message.command) {
                    case 'behaviorInfo1':
                        // Update the UI with the information about the user behavior
                        document.getElementById('behavior-info1').innerText = message.info;
                        break;
                    case 'behaviorInfo2':
                        document.getElementById('behavior-info2').innerText = message.info;
                        break;
                }
            });


        </script>
    </body>
    </html>`;
}
