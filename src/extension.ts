import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { TextEncoder } from 'util';

type Action = {
    idGroup: number;
    timeStamp: number;
    changes: string;
};
type Question = {
    idGroup: number;
    text: string;
};
let currentId = 0;
let currentGroup = "";
let behaviorData: Action[] = [];
let questionData: Question[] = [];
//let panel: vscode.WebviewPanel | undefined;
export function activate(context: vscode.ExtensionContext) {
    console.log('Congratulations, your extension "input-display-webview" is now active!');

    let disposable = vscode.commands.registerCommand('input-display-webview.inputData', () => {
        const panel = vscode.window.createWebviewPanel(
            'inputDisplayWebview',
            'Input Display Webview',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath, './stylesheet/webstyle.css'))]


            }
        );
        const styleSrc = vscode.Uri.file(path.join(context.extensionPath, './stylesheet/webstyle.css')).with({ scheme: 'vscode-resource' });
        const filePath: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'src', 'webview.html'));
        panel.webview.html = fs.readFileSync(filePath.fsPath, 'utf8');
        //panel.webview.html = getWebviewContent();




        panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {

                    case 'showInput':
						
                        vscode.window.showInformationMessage(`You entered: ${message.text}`);
                        currentId++;
                        questionData.push({idGroup:currentId, text: message.text});
                        //currentGroup = message.text;

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
                        behaviorData.push({idGroup: currentId, timeStamp:times , changes: change});
                        break;
                    case 'editQuestion':
                        vscode.window.showInformationMessage(`Question edit: ${message.origin}`);
                        for (let i = 0; i < questionData.length; i++) {
                            if (questionData[i].text === message.origin) {
                                questionData[i].text = message.updated;
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
                    behaviorData.push({idGroup: currentId, timeStamp:time , changes: change});
                    
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
  
    const filePath = vscode.Uri.joinPath(vscode.workspace.workspaceFolders[0].uri, 'data.json');
    const data = {  questionData, behaviorData };
    const jsondata = JSON.stringify(data,null, 2);

    try {
        const content = new TextEncoder().encode(jsondata);
        vscode.workspace.fs.writeFile(filePath, content);
        vscode.window.showInformationMessage("Behavior track data saved to file: data.json");
    } catch (error) {
        vscode.window.showErrorMessage(`Failed to save behavior track data: ${error}`);
    }

}


