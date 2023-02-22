import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
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

