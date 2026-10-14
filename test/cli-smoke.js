"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_child_process_1 = require("node:child_process");
const node_assert_1 = require("node:assert");
describeCliSmoke();
function describeCliSmoke() {
    const output = (0, node_child_process_1.execFileSync)('node', ['dist/cli/CliApp.js'], {
        input: 'help\nexit\n',
        encoding: 'utf8',
        cwd: process.cwd(),
    });
    node_assert_1.strict.ok(output.includes('svg-editor 0.1 — type \'help\' for commands'));
    node_assert_1.strict.ok(output.includes('svg>'));
    node_assert_1.strict.ok(output.includes('help'));
    node_assert_1.strict.ok(output.includes('Available commands'));
}
//# sourceMappingURL=cli-smoke.js.map