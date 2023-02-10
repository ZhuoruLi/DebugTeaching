import * as vscode from 'vscode';


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "debuglearning" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('debuglearning.addbutton', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		const panel = vscode.window.createWebviewPanel(
			'interactive button',
			'Track window',
			vscode.ViewColumn.One,
			{enableScripts: true}
		);
		panel.webview.html = getWebviewContent();
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function getWebviewContent() {
	return `<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
		<title>Teaching Debugging</title>
	</head>
	<body>
        <form>
            <div class="formBox">
                <label for="title">Your question</label>
                <input type="text" placeholder="Your Question" name="question" id="questionInput">
            </div>
            <div class="formBox">
                <button id="btn">Click to Add</button>
            </div>
            <div id="msg">
                <pre></pre>
            </div>
        </form>
	
		<script>
            let questions = [];
            const addQuestion = (event) => {
                event.preventDefault();
                let question = {
                    description: document.getElementById('questionInput').value,
                }
                questions.push(question);
                document.forms[0].reset(); // to clear the form for the next entries
                //document.querySelector('form').reset();

                //for display purposes only
                console.warn('added' , {questions} );
                let pre = document.querySelector('#msg pre');
                pre.textContent = '\n' + JSON.stringify(questions, '\t', 2);

                //saving to localStorage
                localStorage.setItem('MyQuestionList', JSON.stringify(questions) );
            }
            document.addEventListener('DOMContentLoaded', ()=>{
                document.getElementById('btn').addEventListener('click', addQuestion);
            });
		</script>
	</body>
</html>
	`;
}
