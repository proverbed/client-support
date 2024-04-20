"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const emailTemplate = {
    "REPORT1": {
        SUBJECT: "Accountability Report for {{trader}}",
        HTML: `date: {{date}} trader: {{trader}} balance: {{balance}} number of trades: {{numTrades}} 
    
    <table>
    <tbody>
      <!-- {{#each items}} -->
      <tr>
        <td>{{a}}</td>
        <td>{{b}}</td>
      </tr>
      <!-- {{/each}} -->
    </tbody>
  </table>    
    
    `,
        TEXT: "date: {{date}} trader: {{trader}} balance: {{balance}} number of trades: {{numTrades}}",
    },
};
exports.default = emailTemplate;
