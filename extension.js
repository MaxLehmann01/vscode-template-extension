const vscode = require('vscode');
const path = require('path');
const fs = require('fs-extra');

const filename = './template_strings.json'
const template_strings = require(filename);

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {
	context.subscriptions.push(
		vscode.commands.registerCommand('template-extension.newWithTemplate', function (context) {
			newWithTemplate(context);
		})
	);

	context.subscriptions.push(
		vscode.commands.registerCommand('template-extension.newTemplateString', function (context) {
			newTemplateString();
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand('template-extension.deleteTemplateString', function (context) {
			deleteTemplateString();
		})
	)

	context.subscriptions.push(
		vscode.commands.registerCommand('template-extension.openTemplateStringFile', function (context) {
			openTemplateStringConfig();
		})
	)
}

function deactivate() { }

async function openTemplateStringConfig() {
	vscode.workspace.openTextDocument(__dirname + '/' + filename).then(
		document => vscode.window.showTextDocument(document)
	);
}

async function deleteTemplateString() {
	var attributenames = [];
	for (var attributename in template_strings) {
		// if (data.includes("?!?" + attributename + "?!?")) {
		// 	var input = await vscode.window.showInputBox({ title: template_strings[attributename].input_title });
		// 	data = data.replaceAll("?!?" + attributename + "?!?", input);
		// }

		attributenames.push(attributename);
	}

	var template_string = await vscode.window.showQuickPick(attributenames, { title: "Choose Template String to delete" });

	delete template_strings[template_string];

	fs.writeFile(__dirname + '/' + filename, JSON.stringify(template_strings), async (err) => {
		console.log(err);
	});
}

async function newTemplateString() {
	var template_string_name = await vscode.window.showInputBox({ title: "Enter Template String name" });
	if (!template_strings[template_string_name]) {
		var input_title = await vscode.window.showInputBox({ title: "Enter Template String Input Title" });

		var obj = {
			"input_title": input_title
		}

		template_strings[template_string_name] = obj;

		fs.writeFile(__dirname + '/' + filename, JSON.stringify(template_strings), async (err) => {
			console.log(err);
		});
	}
}

async function newWithTemplate(context) {
	const { fsPath } = context;
	const stats = fs.statSync(context.fsPath);
	var fs_path = stats.isDirectory() ? fsPath : path.dirname(fsPath);

	var directory_template = vscode.workspace.rootPath + "\\.template"
	if (fs.existsSync(directory_template)) {
		var files = fs.readdirSync(directory_template);

		if (files.length > 0) {
			var file_selected = await vscode.window.showQuickPick(files);

			fs.readFile(directory_template + "\\" + file_selected, 'utf8', async (err, data) => {
				for (var attributename in template_strings) {
					if (data.includes("?!?" + attributename + "?!?")) {
						var input = await vscode.window.showInputBox({ title: template_strings[attributename].input_title });
						data = data.replaceAll("?!?" + attributename + "?!?", input);
					}
				}

				newFileName = await vscode.window.showInputBox({ title: "Enter new filename!" });
				newFileName += path.extname(file_selected);
				fs.writeFileSync(fs_path + "\\" + newFileName, data);
			});
		}
		else {
			console.log("'.template' Folder Does not exist!");
		}
	}
}

module.exports = {
	activate,
	deactivate
}