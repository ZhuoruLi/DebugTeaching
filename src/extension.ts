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
		<title>Cat Coding</title>
	</head>
	<body>
		<div>
			<form onsubmit="return displayData()">
				<input type="text" placeholder="Your Question" name="question" id="questionInput">
				<input type="submit" value="Add it">
			</form>
		</div>
		<div id="displayData" contenteditable="true"></div>
	
		<script>
			function displayData() {
				const question = document.getElementById("questionInput").value;
				const displayData = document.getElementById("displayData");
				displayData.innerHTML = question;
				return false;
			}
		</script>
	</body>
	</html>
	`;
}
