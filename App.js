$(document).ready(function () {
    let transactions = [];

    // API endpoint for the backend
    const API_URL = "http://localhost:3000/api/transactions";

    // Handle form submission
    $('#transaction-form').submit(function (e) {
        e.preventDefault();

        let type = $('#type').val();
        let category = $('#category').val();
        let amount = parseFloat($('#amount').val());
        let date = new Date().toLocaleDateString(); // Use current date

        let transaction = { type, category, amount, date };

        // Save the transaction via the backend API
        $.ajax({
            url: `${API_URL}/add`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(transaction),
            success: function (response) {
                transactions.push(response);
                updateTable();
                updateChart();
            },
            error: function (error) {
                console.error("Error adding transaction:", error);
            }
        });
    });

    // Fetch transactions from the backend
    function fetchTransactions() {
        $.get(`${API_URL}`, function (data) {
            transactions = data;
            updateTable();
            updateChart();
        });
    }

    // Update the transaction table
    function updateTable() {
        let tableBody = $('#transaction-table');
        tableBody.empty();

        transactions.forEach(tr => {
            let row = `<tr>
                <td>${tr.type}</td>
                <td>${tr.category}</td>
                <td>${tr.amount.toFixed(2)}</td>
                <td>${tr.date}</td>
            </tr>`;
            tableBody.append(row);
        });
    }

    // Update the chart (replace with your chart logic)
    function updateChart() {
        let ctx = $('#expenseChart');
        let incomeData = transactions.filter(tr => tr.type === 'income').map(tr => tr.amount);
        let expenseData = transactions.filter(tr => tr.type === 'expense').map(tr => tr.amount);
        let labels = transactions.map(tr => tr.category);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Income',
                    data: incomeData,
                    backgroundColor: 'rgba(54, 162, 235, 0.6)',
                }, {
                    label: 'Expenses',
                    data: expenseData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                }]
            }
        });
    }

    // Fetch all transactions on page load
    fetchTransactions();
});
