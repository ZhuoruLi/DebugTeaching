import * as vscode from 'vscode';
// import * as fs from 'fs';
import { TextEncoder } from 'util';

type Action = {
    idGroup: string;
    timeStamp: number;
    changes: string;
};
let currentGroup = "";
let behaviorData: Action[] = [];
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
                        currentGroup = message.text;

                        // behaviorData.push({idGroup:group, timeStamp: Date.now(), changes:});
                        break;
                    case 'behaviorInfo1':
                        vscode.window.showInformationMessage(`Line edit: ${message.info}`);
                        break;
                    case 'behaviorInfo2':
                        vscode.window.showInformationMessage(`User behavior: ${message.info}`);
                    case 'saveData':
                        saveData();
                        break;
                    case 'AddAction':
                        let times = Date.now();
                        let change:string = message.text;
                        behaviorData.push({idGroup: currentGroup, timeStamp:times , changes: change});
                        break;
                    case 'editQuestion':
                        vscode.window.showInformationMessage(`Question edit: ${message.origin}`);
                        for (let i = 0; i < behaviorData.length; i++) {
                            if (behaviorData[i].idGroup === message.origin) {
                                behaviorData[i].idGroup = message.updated;
                            }
                        }
                        break;
                        
                
                }
            },
            undefined,
            context.subscriptions
        );
        
            
        // });
        let toprint:string  = "";
        let currentline:number = -1;
        vscode.workspace.onDidChangeTextDocument(event => {
            if (panel) {
                const line = event.contentChanges[0].range.start.line;
                //when change the line, print what changes to the new line, 
                //also store the current string;
                if (currentline !== line) {
                    currentline = line;
                    let time = Date.now();
                    let change:string = "Line " + currentline + " changed: "+toprint;
                    behaviorData.push({idGroup: currentGroup, timeStamp:time , changes: change});
                    
                    toprint = "";

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
                const objIndex = behaviorData.findIndex((obj => obj.changes.includes("Line " + currentline)));
                behaviorData[objIndex].changes += behavior;
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
  
    const filePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'behavior-track.json');
    const jsondata = JSON.stringify(behaviorData,null, 2);
    //join("\n"
    // if (filePath) {
    //     const content = new TextEncoder().encode(jsondata);
    //     vscode.workspace.fs.writeFile(filePath, content);
    // }
    try {
        const content = new TextEncoder().encode(jsondata);
        vscode.workspace.fs.writeFile(filePath, content);
        vscode.window.showInformationMessage("Behavior track data saved to file: behavior-track.json");
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
        <style>
            body {
                background-color: #F6F6F6;
            }
            #MainPage{
                display: flex;
                flex-direction: column;
                gap: 20px

            }
            #msg{
                background-color: #45FDC6;
                color: #FFF;
                width: 60%;
                border-radius: 4px;
            }
            .container{
                display: flex;
                justify-content: flex-start;
                

            }


            input[type="text"] {
                color: #333;
                font-size: 16px;
                font-weight: bold;
                padding: 8px;
                border: none;
                border-radius: 4px;
                box-shadow: none;
                background-color: #FFF;
                margin-right: 8px;
            }
            #submitButton {
                background-color: #45FDC6;
                color: #FFF;
                border: none;
                border-radius: 4px;
                padding: 8px;
                cursor: pointer;
            }
            #storeButton {
                background-color: #45FDC6;
                color: #FFF;
                border: none;
                border-radius: 4px;
                padding: 8px;
                cursor: pointer;
                margin-top: 20px;
            }
            #behaviorBox {
                color: #FFF;
                display: flex;
                flex-direction:column;
                justify-content:flex-start;
                align-items: flex-start;
                width: 70%;
                height: auto;
                background-color: #45E7FD;
                border-radius: 4px;
                margin-left: auto;

            }
            #Add-action {
                color: #FFF;
                display: flex;
                flex-direction:row;
                justify-content:flex-end;
                align-items: flex-start;
                width: 70%;
                
                border-radius: 4px;
                margin-left: auto;
            }
            #submitAction {
                background-color: #45FDC6;
                color: #FFF;
                border: none;
                border-radius: 4px;
                padding: 8px;
                cursor: pointer;
            }
            #behavior-info1 {
                align-self: flex-start;
                background-color: #45E7FD;

              }
              
            #behavior-info2 {
                align-self: flex-start;
                background-color: #45E7FD;

            }
        </style>
    </head>
    <body>
    <div id="MainPage">

   
        <div id="msg">
            <pre>Questions:</pre>
            <ul id="questionList"></ul>
        </div>
        <div id = "behaviorBox">
            Actions:
            <div id="behavior-info1">
            </div>
            <div id="behavior-info2">
            </div>
        </div>
        <div id = "Add-action">
            <input type="text" id="inputAction">
            <button id="submitAction">Add Action</button>
        </div>
        <div class="container">
            <input type="text" id="inputBox">
            <button id="submitButton">Submit</button>
        </div>

        



    </div>
    <button id="storeButton">Store</button>
    <script>
        let questions = [];
        function addQuestion() {
            const question = document.getElementById('inputBox').value;
            questions.push(question);
            // if (questions.length == 1) {
                

            //     let pre = document.querySelector('#msg pre');
            //     pre.textContent = "Questions: " + questions[questions.length - 1];

            //     // pre.contentEditable = true;


            //     vscode.postMessage({
            //         command: 'showInput',
            //         text:  question
            //     })
            //     return;
            // }
            // const container = document.createElement('div');
            // container.setAttribute('class', 'question');
            // container.style.backgroundColor = '#45FDC6';
            // container.style.color = '#FFF';
            // container.style.width = '60%';
            // container.style.borderRadius = '4px';
            // const preElement = document.createElement('pre');
            // const textNode = document.createTextNode('Questions:' + questions[questions.length - 1]);
            // preElement.appendChild(textNode);
            // container.appendChild(preElement);
            // document.getElementById("MainPage").appendChild(container);
            // vscode.postMessage({
            //     command: 'showInput',
            //     text:  question
            // })
            // return;
            if (questions.length == 1) {
                console.log(questions,length);
                let pre = document.querySelector('#msg pre');
                pre.textContent = "Questions: " + questions[questions.length - 1];
                pre.contentEditable = true;
                pre.addEventListener('blur', function() {
                    const originQuestion = questions[0];
                    questions[questions.length - 1] = pre.textContent.replace("Questions: ", "");
                    vscode.postMessage({
                        command: 'editQuestion',
                        updated:  questions[0],
                        origin:  originQuestion
                    })
                });
                vscode.postMessage({
                    command: 'showInput',
                    text:  question
                })
                return;
            }
            console.log(questions,length);
            const container = document.createElement('div');
            container.setAttribute('class', 'question');
            container.style.backgroundColor = '#45FDC6';
            container.style.color = '#FFF';
            container.style.width = '60%';
            container.style.borderRadius = '4px';
        
            const preElement = document.createElement('pre');
            const textNode = document.createTextNode('Questions: ' + questions[questions.length - 1]);
            preElement.appendChild(textNode);
            preElement.contentEditable = true;
            preElement.addEventListener('blur', function() {
                const index = Array.from(document.querySelectorAll('.question')).indexOf(container);
                const originQuestion = questions[index+1];
                const updateQuestion = preElement.textContent.replace("Questions: ", "");
                questions[index] = updateQuestion;
                vscode.postMessage({
                    command: 'editQuestion',
                    updated:  questions[index],
                    origin:  originQuestion
                })
            });
        
            container.appendChild(preElement);
            document.getElementById("MainPage").appendChild(container);
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
        function addAction() {
            const action = document.getElementById('inputAction').value;
            const container = document.createElement('div');
            container.setAttribute('class', 'customAction');
            container.style.backgroundColor = '#45E7FD';
            container.style.color = '#FFF';
            const preElement = document.createElement('pre');
            const textNode = document.createTextNode(action);
            preElement.appendChild(textNode);
            container.appendChild(preElement);
            document.getElementById("behaviorBox").appendChild(container);
            vscode.postMessage({
                command: 'AddAction',
                text:  action
            })

        }
        const vscode = acquireVsCodeApi();
        document.getElementById('submitButton').addEventListener("click", addQuestion);
        document.getElementById('storeButton').addEventListener("click", storeChanges);
        document.getElementById('submitAction').addEventListener("click", addAction);
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
