const Modal = {
    open() {
        document
            .querySelector(".modal-overlay")
            .classList
            .add("active")
    },
    close() {
        document
            .querySelector(".modal-overlay")
            .classList
            .remove("active")
    }
}
const UpdateTransactionModal = {
    open(index) {
        document
            .querySelector("#update-transaction-modal")
            .classList
            .add("active")
        document
            .querySelector("#update-transaction-form")
            .setAttribute("aria-modal-index", index)

        DOM.updateTransactionModal(index)
    },
    close() {
        document
            .querySelector("#update-transaction-modal")
            .classList
            .remove("active")
    }
}
const OpeningBalanceModal = {
    open() {
        document
            .querySelector("#opening-balance-modal")
            .classList
            .add("active")
    },
    close() {
        document
            .querySelector("#opening-balance-modal")
            .classList
            .remove("active")
    }
}

const CardColor = {
    positive() {
        document
            .querySelector(".card.total")
            .classList
            .remove("negative")
        document
            .querySelector(".card.total")
            .classList
            .add("positive")
    },
    negative() {
        document
            .querySelector(".card.total")
            .classList
            .remove("positive")
        document
            .querySelector(".card.total")
            .classList
            .add("negative")
    }
}

const Calendar = {
    months: [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ],
    activeMonth() {
        let month = Storage.getActiveMonth()

        if (!month) {
            month = new Date().getMonth()
            Storage.setActiveMonth(month)
        }

        return Number(month)
    },
    setActiveMonth(month) {
        Storage.setActiveMonth(month)
    },
    switchMonth(intention) {
        if (intention !== 'previous' && intention !== 'next') return

        const activeMonth = Calendar.activeMonth()

        if (intention === 'previous') {
            document
                .querySelector("#switch-previous-month-button")
                .disabled = true

            if (activeMonth === 0) return
        }
        else if (intention === 'next') {
            document
                .querySelector("#switch-next-month-button")
                .disabled = true

            if (activeMonth === Calendar.months.length -1) return
        }

        const switchMonth   = document.getElementById('switch-month')
        const previousMonth = document.getElementById('previous-month')
        const currentMonth  = document.getElementById('current-month')
        const nextMonth     = document.getElementById('next-month')

        const currentMonthAlignment   = (switchMonth.offsetWidth / 2) - (currentMonth.offsetWidth / 2)
        currentMonth.style.transition = 'left 300ms ease-in-out, right 300ms ease-in-out, opacity 150ms linear'
        currentMonth.style.opacity    = '0'

        if (intention === 'previous') {
            const previousMonthAlignment   = (switchMonth.offsetWidth / 2) - (previousMonth.offsetWidth / 2)
            previousMonth.style.transition = 'left 300ms ease-in-out, opacity 150ms linear'
            previousMonth.style.opacity    = '100'
            previousMonth.style.left       = `${previousMonthAlignment}px`

            currentMonth.style.left = `${currentMonthAlignment}px`
        }
        else if (intention === 'next') {
            const alignmentNextMonth   = (switchMonth.offsetWidth / 2) - (nextMonth.offsetWidth / 2)
            nextMonth.style.transition = 'right 300ms ease-in-out, opacity 150ms linear'
            nextMonth.style.opacity    = '100'
            nextMonth.style.right      = `${alignmentNextMonth}px`

            currentMonth.style.right = `${currentMonthAlignment}px`
        }

        setTimeout(() => {
            currentMonth.style.transition = 'none'
            currentMonth.style.opacity    = '100'

            if (intention === 'previous') {
                previousMonth.style.transition = 'none'
                previousMonth.style.opacity    = '0'
                previousMonth.style.left       = '0'

                currentMonth.style.left = '-50%'
                Calendar.setActiveMonth(Calendar.activeMonth()-1)
                DOM.updateCalendar()
            }
            else if (intention === 'next') {
                nextMonth.style.transition = 'none'
                nextMonth.style.opacity    = '0'
                nextMonth.style.right      = '0'

                currentMonth.style.right = '-50%'
                Calendar.setActiveMonth(Calendar.activeMonth()+1)
                DOM.updateCalendar()
            }

            if (activeMonth !== 1) {
                document
                    .querySelector("#switch-previous-month-button")
                    .disabled = false
            }
            if (activeMonth === Calendar.months.length -1) {
                document
                    .querySelector("#switch-next-month-button")
                    .disabled = false
            }

            App.reload()
        }, 300)
    }
}

const Storage = {
    get() {
        const transactions = JSON.parse(localStorage.getItem("dev.finances:transactions"))

        if (!transactions) {
            let newTransactions = []

            for (let index = 0; index < 12; index++) {
                newTransactions.push({
                    monthIndex: index,
                    transactions: [],
                    incomes: 0,
                    expanses: 0,
                    total: 0,
                    openingBalance: 0
                })
            }
            return newTransactions
        }

        return transactions
    },
    getTransactions(monthIndex)  {
        return Storage.get()[monthIndex].transactions
    },
    getOpeningBalance() {
        return localStorage.getItem("dev.finances:openingBalance") || ""
    },
    getActiveMonth() {
        return localStorage.getItem("dev.finances:activeMonth") || ""
    },
    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    },
    update(transactionIndex, transaction, monthIndex) {
        let transactionsList = Storage.get()
        let transactions = Storage.getTransactions(monthIndex)

        if (transactions) {
            if (transactions[transactionIndex]) {
                transactions[transactionIndex] = transaction
            }
        }
        transactionsList[monthIndex].transactions = transactions
        Transaction.set(transactionsList)
    },
    setOpeningBalance(openingBalance) {
        localStorage.setItem("dev.finances:openingBalance", openingBalance)
    },
    setActiveMonth(month) {
        localStorage.setItem("dev.finances:activeMonth", month)
    }
}

const Transaction = {
    all: Storage.get(),
    add(transaction, monthIndex) {
        let transactionsList = Storage.get()
        transactionsList[monthIndex].transactions.push(transaction)
        Transaction.set(transactionsList)

        App.reload(true)
    },
    set(transactions) {
        Storage.set(transactions)
    },
    update(modalIndex, transaction, monthIndex) {
        Storage.update(modalIndex, transaction, monthIndex)

        App.reload(true)
    },
    addOpeningBalance(openingBalance) {
        Storage.setOpeningBalance(openingBalance.amount)

        App.reload()
    },
    remove(index) {
        const monthIndex = Calendar.activeMonth()
        let transactionsList = Storage.get()
        transactionsList[monthIndex].transactions.splice(index, 1)
        Transaction.set(transactionsList)

        App.reload(true)
    },
    incomes() { // Somar entradas
        const monthIndex = Calendar.activeMonth()
        let income = 0

        Storage.getTransactions(monthIndex).forEach(transaction => {
            if (transaction.deposit) {
                if (transaction.amount > 0) {
                    income += transaction.amount
                }
            }
        })
        return income
    },
    expenses() { // Somar saídas
        const monthIndex = Calendar.activeMonth()
        let expense = 0

        Storage.getTransactions(monthIndex).forEach(transaction => {
            if (transaction.deposit) {
                if (transaction.amount < 0) {
                    expense += transaction.amount
                }
            }
        })
        return expense
    },
    total(allValues=false) { // Entradas menos saídas mais saldo inicial
        const incomes = Transaction.incomes()
        const expenses = Transaction.expenses()
        const openingBalance = Number(Storage.getOpeningBalance())

        const total = incomes + expenses + openingBalance

        if (!allValues) return total

        return {incomes, expenses, total, openingBalance}
    }
}

const DOM = {
    transactionsContainer: document.querySelector("#data-table tbody"),
    addTransaction(transactions, index) {
        const deposit = transactions.deposit ? "deposit-activated" : "deposit-not-activated"

        const tr = document.createElement("tr")
        tr.innerHTML = DOM.innerHTMLTransaction(transactions, index)
        tr.classList.add(`${deposit}`)
        tr.dataset.index = index

        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transactions, index) {
        const CSSclass = transactions.amount > 0 ? "income" : "expense"
        const amount = Utils.formatCurrency(transactions.amount)
        const UpdateTransactionModal_func = `UpdateTransactionModal.open(${index})`
        const html = `
        <td onClick="${UpdateTransactionModal_func}" class="description">${transactions.description}</td>
        <td onClick="${UpdateTransactionModal_func}" class="${CSSclass}">${amount}</td>
        <td onClick="${UpdateTransactionModal_func}" class="date">${transactions.date}</td>
        <td onclick="Transaction.remove(${index})" class="center-item">
            <img src="./assets/minus.svg" class="remove" alt="Remover Transação">
        </td>
        `
        return html
    },
    updateTransactionModal(modalIndex) {
        const monthIndex = Calendar.activeMonth()
        const {description, amount, date, deposit} = Storage.getTransactions(monthIndex)[modalIndex]

        document
            .querySelector("#update-description")
            .value = description
        document
            .querySelector("#update-amount")
            .value = Utils.formatSimpleAmountToText(String(amount))
        document
            .querySelector("#update-date")
            .value = Utils.unFormatDate(date)
        document
            .querySelector("#update-deposit")
            .checked = deposit
    },
    updateOpeningBalance() {
        document
            .querySelector("#openingBalanceDisplay")
            .innerHTML = Utils.formatCurrency(Storage.getOpeningBalance())
        document
            .querySelector("#opening-balance-amount")
            .value = Utils.formatSimpleAmountToText(Storage.getOpeningBalance())
    },
    updateBalance() {
        const {incomes, expenses, total} = Transaction.total(true)
        document
            .querySelector("#incomeDisplay")
            .innerHTML = Utils.formatCurrency(incomes)
        document
            .querySelector("#expenseDisplay")
            .innerHTML = Utils.formatCurrency(expenses)
        document
            .querySelector("#totalDisplay")
            .innerHTML = Utils.formatCurrency(total)
    },
    updateCalendar() {
        const activeMonth = Calendar.activeMonth()

        const previousMonth = activeMonth - 1
        const nextMonth     = activeMonth + 1

        let disabledPreviousMonth = false
        if (activeMonth === 0) disabledPreviousMonth = true

        let disabledNextMonth = false
        if (activeMonth === Calendar.months.length -1) disabledNextMonth = true

        document
            .querySelector("#switch-previous-month-button")
            .disabled = disabledPreviousMonth
        document
            .querySelector("#previous-month")
            .innerHTML = disabledPreviousMonth ? '' : Calendar.months[previousMonth]
        document
            .querySelector("#current-month")
            .innerHTML = Calendar.months[activeMonth]
        document
            .querySelector("#next-month")
            .innerHTML = disabledNextMonth ? '' : Calendar.months[nextMonth]
        document
            .querySelector("#switch-next-month-button")
            .disabled = disabledNextMonth
        document
            .querySelector("#year-calendar")
            .innerHTML = new Date().getFullYear()

    },
    totalCardColor(){
        const total = Transaction.total()
        if (total < 0) {
            // - Negativo
            console.info("Seu Valor Total Esta Negativo: " + Utils.formatSimple(total))
            CardColor.negative()
        } else {
            // - Positivo
            console.info("Seu Valor Total Esta Positivo: " + Utils.formatSimple(total))
            CardColor.positive()
        }
    },
    clearTransactions(){
        DOM.transactionsContainer.innerHTML = ""
    }
}

const Utils = {
    formatCurrency(value) {
        const signal = Number(value) < 0 ? "-&nbsp;" : "+&nbsp;"

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })

        return signal + value
    },
    formatAmount(value) {
        value = value * 100
        return Math.round(value)
    },
    formatSimpleAmountToText(value) {
        const decimalPlace = value.slice(-2)
        const integer = value.slice(0, -2)

        const formattedAmount = `${integer}.${decimalPlace}`

        return formattedAmount
    },
    formatSimple(value){
        const signal = Number(value) < 0 ? "- " : "+ "

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100
        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
        })

        return signal + value
    },
    formatDate(date) {
        const splittedDate = date.split("-")
        return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
    },
    unFormatDate(date) {
        const splittedDate = date.split("/")
        return `${splittedDate[2]}-${splittedDate[1]}-${splittedDate[0]}`
    }
}

const Form = {
    description: document.querySelector("input#description"),
    amount:      document.querySelector("input#amount"),
    date:        document.querySelector("input#date"),
    deposit:     document.querySelector("input#deposit"),
    getValues() {
        return {
            description: Form.description.value,
            amount:      Form.amount.value,
            date:        Form.date.value,
            deposit:     Form.deposit.checked
        }
    },
    validateFields() {
        const {description, amount, date} = Form.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },
    formatValues() {
        let {description, amount, date, deposit} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date   = Utils.formatDate(date)

        return {
            description,
            amount,
            date,
            deposit
        }
    },
    saveTransaction(transaction, monthIndex) {
        Transaction.add(transaction, monthIndex)
    },
    clearFields() {
        Form.description.value = ""
        Form.amount.value      = ""
        Form.date.value        = ""
        Form.deposit.checked   = true
    },
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()                          // Verifica campos
            const transaction = Form.formatValues()        // Formata valores
            const monthIndex = Calendar.activeMonth()      // Pega mês ativo
            Form.saveTransaction(transaction, monthIndex)  // Adiciona valores
            Form.clearFields()                             // Limpa campos

            Modal.close()                                  // Fecha modal
        } catch (error) {
            console.warn(error.message)
            toastError(error.message)
            //alert(error.message)
        }
    }
}
const UpdateTransactionForm = {
    description: document.querySelector("input#update-description"),
    amount:      document.querySelector("input#update-amount"),
    date:        document.querySelector("input#update-date"),
    deposit:     document.querySelector("input#update-deposit"),
    getValues() {
        return {
            description: UpdateTransactionForm.description.value,
            amount:      UpdateTransactionForm.amount.value,
            date:        UpdateTransactionForm.date.value,
            deposit:     UpdateTransactionForm.deposit.checked
        }
    },
    validateFields() {
        const {description, amount, date} = UpdateTransactionForm.getValues()

        if (description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },
    formatValues() {
        let {description, amount, date, deposit} = UpdateTransactionForm.getValues()

        amount = Utils.formatAmount(amount)
        date   = Utils.formatDate(date)

        return {
            description,
            amount,
            date,
            deposit
        }
    },
    saveTransaction(modalIndex, transaction, monthIndex) {
        Transaction.update(modalIndex, transaction, monthIndex)
    },
    submit(event) {
        event.preventDefault()
        const modalIndex = document
            .querySelector("#update-transaction-form")
            .getAttribute("aria-modal-index")

        try {
            UpdateTransactionForm.validateFields()                                      // Verifica campos
            const transaction = UpdateTransactionForm.formatValues()                    // Formata valores
            const monthIndex = Calendar.activeMonth()                                   // Pega mês ativo
            UpdateTransactionForm.saveTransaction(modalIndex, transaction, monthIndex)  // Adiciona valores
            UpdateTransactionModal.close()                                              // Fecha modal
        } catch (error) {
            console.warn(error.message)
            toastError(error.message)
        }
    }
}
const OpeningBalanceForm = {
    amount: document.querySelector("input#opening-balance-amount"),
    getValues() {
        return {
            amount: OpeningBalanceForm.amount.value
        }
    },
    validateFields() {
        const {amount} = OpeningBalanceForm.getValues()

        if (amount.trim() === "") {
            throw new Error("Por favor, preencha o campo!")
        }
    },
    formatValues() {
        let {amount} = OpeningBalanceForm.getValues()

        amount = Utils.formatAmount(amount)

        return {
            amount
        }
    },
    saveOpeningBalance(openingBalance) {
        Transaction.addOpeningBalance(openingBalance)
    },
    submit(event) {
        event.preventDefault()

        try {
            OpeningBalanceForm.validateFields()                      // Verifica campos
            const openingBalance = OpeningBalanceForm.formatValues() // Formata valores
            OpeningBalanceForm.saveOpeningBalance(openingBalance)    // Adiciona valores

            OpeningBalanceModal.close()                              // Fecha modal
        } catch (error) {
            console.warn(error.message)
            toastError(error.message)
        }
    }
}


const App = {
    initAll() {
        App.initDOM()

        Storage.setOpeningBalance(Storage.getOpeningBalance())
        Storage.set(Storage.get())
    },
    initDOM() {
        Storage.getTransactions(Calendar.activeMonth())
            .forEach((transactions, index) => DOM.addTransaction(transactions, index))

        DOM.updateCalendar()        // Atualiza o mês ativo
        DOM.updateOpeningBalance()  // Atualiza o valor do saldo inicial
        DOM.updateBalance()         // Atualiza o valor dos cards
        DOM.totalCardColor()        // Atualiza a cor do card 'total'
    },
    reload(DOMOnly=false) {
        DOM.clearTransactions()
        if (DOMOnly) return App.initDOM()
        App.initAll()
    }
}
App.initAll()



function toastError(message = "ERRO!") {
    /*let a = document.querySelector("???").innerHTML = `
    <div id="toast">
    <div class="img">Icon</div>
    <div class="description">${message}</div>
    </div>`*/

    const toastId = document.querySelector("#toast")
    toastId.className = "show"

    setTimeout(() => {
        toastId.className = toastId.className.replace("show", "")
    }, 5000)
}