const emailTemplate = {
  "REPORT1": {
    SUBJECT: "Accountability Report for {{trader}}",
    HTML: `date: {{date}} trader: {{trader}} balance: {{balance}} number of trades: {{numTrades}} 
    
    <table>
    <tbody>
      <!-- {{#each items}} -->
      <tr>
        <th>Ticket</th>
        <th>Instrument</th>
        <th>Type</th>
        <th>Volume</th>
        <th>Risk</th>
        <th>Profit</th>
      </tr>
      <tr>
        <td>{{ticket}}</td>
        <td>{{instrument}}</td>
        <td>{{type}}</td>
        <td>{{volume}}</td>
        <td>{{risk}}</td>
        <td>{{profit}}</td>
        </tr>
      <!-- {{/each}} -->
    </tbody>
  </table>    
    
    `,
    TEXT: "date: {{date}} trader: {{trader}} balance: {{balance}} number of trades: {{numTrades}}",
  },
};
export default emailTemplate;
