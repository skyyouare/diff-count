// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { window, StatusBarAlignment, Disposable } from 'vscode';
const diff = require('diff')
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed


const createDiffCounter = () => {
    const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 200);

    return {
        update: () => {
            const activeEditor = window.activeTextEditor;

            if (!activeEditor) {
                statusBarItem.hide();
                return;
            }

			let editors = window.visibleTextEditors
			if(editors.length!=2){
				console.log('不是2个文件')
				statusBarItem.hide();
				return false;
			}
			//计算差异
			var left = editors[0];
			var right = editors[1];
			if(left.document.uri.fsPath!=right.document.uri.fsPath){
				// console.log('2个文件名不一致')
			}
			let left_text = left.document.getText()
			let right_text = right.document.getText()
			//对比
			const diff_arr = diff.diffLines(left_text, right_text, false, true);
			var count_added = 0;
			var count_removed = 0;
			// console.log(diff_arr)
			for(let key in diff_arr){
				if(diff_arr[key].added){
					count_added ++;
				}
				if(diff_arr[key].removed){
					count_removed ++;
				}
			}
			statusBarItem.text = `${count_added} added ${count_removed} removed`;

            statusBarItem.show();
        },
        dispose: () => {
            statusBarItem.dispose();
        }
    };
};

const createDiffCounterController = () => {
    const diffCounter = createDiffCounter();
    diffCounter.update();

    const eventDisposable = Disposable.from([
        window.onDidChangeActiveTextEditor(diffCounter.update),
        window.onDidChangeTextEditorSelection(diffCounter.update)
    ]);

    return {
        dispose: () => {
            diffCounter.dispose();
            eventDisposable.dispose();
        }
    };
};
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	console.log('Congratulations, your extension "diff-count" is now active!');

    const controller = createDiffCounterController();

    context.subscriptions.push(controller);
}

// this method is called when your extension is deactivated
function deactivate() {}

export default {
	activate,
	deactivate
}
