const MenuButton = {
    toggle() {
        document
            .querySelector(".add-category-button")
            .classList
            .contains("active") ? MenuButton.close() : MenuButton.open()
    },
    open() {
        const addTransactionButton = document.querySelector(".add-transaction-button")
        const addCategoryButton = document.querySelector(".add-category-button")
        addTransactionButton.classList.add("active")
        addCategoryButton.classList.add("active")
    },
    close() {
        const addTransactionButton = document.querySelector(".add-transaction-button")
        const addCategoryButton = document.querySelector(".add-category-button")
        addTransactionButton.classList.remove("active")
        addCategoryButton.classList.remove("active")
    }
}
const CategoryModal = {
    open() {
        document
            .querySelector("#category-modal")
            .classList
            .add("active")

        DOM.categoryModal()
    },
    close() {
        document
            .querySelector("#category-modal")
            .classList
            .remove("active")
    }
}
const CreateTransactionModal = {
    open() {
        document
            .querySelector(".modal-overlay")
            .classList
            .add("active")

        DOM.createTransactionModal()
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
    totalMonth: {
        positive() {
            document
                .querySelector(".card.total-month")
                .classList
                .remove("negative")
            document
                .querySelector(".card.total-month")
                .classList
                .add("positive")
        },
        negative() {
            document
                .querySelector(".card.total-month")
                .classList
                .remove("positive")
            document
                .querySelector(".card.total-month")
                .classList
                .add("negative")
        }
    },
    totalBalance: {
        positive() {
            document
                .querySelector(".card.total-balance")
                .classList
                .remove("negative")
            document
                .querySelector(".card.total-balance")
                .classList
                .add("positive")
        },
        negative() {
            document
                .querySelector(".card.total-balance")
                .classList
                .remove("positive")
            document
                .querySelector(".card.total-balance")
                .classList
                .add("negative")
        }
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
                    totalMonth: 0,
                    transactions: []
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
    getCategories() {
        return JSON.parse(localStorage.getItem("dev.finances:categories")) || ['lazer', 'carro', 'casa', 'trabalho']
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
    },
    updateCategory(category) {
        let categories = Storage.getCategories()
        categories.push(category)
        localStorage.setItem("dev.finances:categories", JSON.stringify(categories))
    },
    setCategory(category) {
        let categories = Storage.getCategories()
        categories = categories.filter(item => item !== category)
        localStorage.setItem("dev.finances:categories", JSON.stringify(categories))
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
    totalMonth(allValues=false) {
        const monthIndex = Calendar.activeMonth()
        const openingBalance = Number(Storage.getOpeningBalance())

        const incomes = Transaction.incomes()
        const expenses = Transaction.expenses()

        const totalIE = incomes + expenses
        const totalIEWithOpeningBalance = incomes + expenses + openingBalance
        const totalMonth = totalIEWithOpeningBalance

        let transactionsList = Storage.get()
        transactionsList[monthIndex].totalMonth = totalIE
        Transaction.set(transactionsList)

        if (!allValues) return totalMonth
        return {incomes, expenses, totalMonth, openingBalance}
    },
    totalBalance() {
        const monthIndex = Calendar.activeMonth()
        const openingBalance = Number(Storage.getOpeningBalance())

        let transactionsList = Storage.get()
        let totalBalance = 0 + openingBalance

        for (let index = 0; index <= monthIndex; index++) {
            const totalMonth = transactionsList[index].totalMonth
            totalBalance += totalMonth
        }

        return totalBalance
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
        <td onClick="${UpdateTransactionModal_func}" class="description">${String(transactions.category)[0].toUpperCase() + String(transactions.category).substring(1)}</td>
        <td onClick="${UpdateTransactionModal_func}" class="${CSSclass}">${amount}</td>
        <td onClick="${UpdateTransactionModal_func}" class="date">${transactions.date}</td>
        <td onclick="Transaction.remove(${index})" class="center-item">
            <img src="./assets/minus.svg" class="remove" alt="Remover Transação">
        </td>
        `
        return html
    },
    categoryModal() {
        const categoryGroup = document.querySelector(".category-group")
        const categories = Storage.getCategories()

        categoryGroup.innerHTML = ""
        for (let index = 0; index < categories.length; index++) {
            const category = categories[index]

            const p = document.createElement("p")
            p.value = category
            p.innerHTML = category

            categoryGroup.appendChild(p)
        }
    },
    createTransactionModal() {
        const select = document.querySelector("#category")
        const categories = Storage.getCategories()

        select.innerHTML = ""

        const option = document.createElement("option")
        option.value = '-1'
        option.innerHTML = 'Selecione a categoria:'
        select.appendChild(option)

        for (let index = 0; index < categories.length; index++) {
            const category = categories[index]

            const option = document.createElement("option")
            option.value = category
            option.innerHTML = category

            select.appendChild(option)
        }
    },
    updateTransactionModal(modalIndex) {
        const monthIndex = Calendar.activeMonth()
        const {category, description, amount, date, deposit} = Storage.getTransactions(monthIndex)[modalIndex]

        const select = document.querySelector("#update-category")
        const categories = Storage.getCategories()

        select.innerHTML = ""
        for (let index = 0; index < categories.length; index++) {
            const category = categories[index]

            const option = document.createElement("option")
            option.value = category
            option.innerHTML = category

            select.appendChild(option)
        }

        document
            .querySelector("#update-category")
            .value = category
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
        const {incomes, expenses, totalMonth} = Transaction.totalMonth(true)
        const totalBalance = Transaction.totalBalance()

        document
            .querySelector("#incomeDisplay")
            .innerHTML = Utils.formatCurrency(incomes)
        document
            .querySelector("#expenseDisplay")
            .innerHTML = Utils.formatCurrency(expenses)
        document
            .querySelector("#totalMonthDisplay")
            .innerHTML = Utils.formatCurrency(totalMonth)
        document
            .querySelector("#totalBalanceDisplay")
            .innerHTML = Utils.formatCurrency(totalBalance)
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
        const totalOfMonth = Transaction.totalMonth()
        if (totalOfMonth < 0) CardColor.totalMonth.negative()
        else CardColor.totalMonth.positive()

        const totalOfBalance = Transaction.totalBalance()
        if (totalOfBalance < 0) CardColor.totalBalance.negative()
        else CardColor.totalBalance.positive()
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
    category:    document.querySelector("select#category"),
    description: document.querySelector("input#description"),
    amount:      document.querySelector("input#amount"),
    date:        document.querySelector("input#date"),
    deposit:     document.querySelector("input#deposit"),
    getValues() {

        return {
            category:    Form.category.value,
            description: Form.description.value,
            amount:      Form.amount.value,
            date:        Form.date.value,
            deposit:     Form.deposit.checked
        }
    },
    validateFields() {
        const {category, description, amount, date} = Form.getValues()

        if (category === '-1' || description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },
    formatValues() {
        let {category, description, amount, date, deposit} = Form.getValues()

        amount = Utils.formatAmount(amount)
        date   = Utils.formatDate(date)

        return {
            category,
            description,
            amount,
            date,
            deposit
        }
    },
    saveTransaction(transaction, monthIndex) {
        Transaction.add(transaction, monthIndex)
    },
    getDataByTransaction(date) {
        const cleanedDate  = String(date).replace(/\D/g, "")
        let monthIndex = cleanedDate.substring(2, 4)

        if (monthIndex.charAt(0) === '0') {
            monthIndex = monthIndex.substring(1) // Remove o primeiro caractere "0"
            monthIndex = String(Number(monthIndex) - 1)
        }

        return monthIndex
    },
    clearFields() {
        Form.category.value    = "-1"
        Form.description.value = ""
        Form.amount.value      = ""
        Form.date.value        = ""
        Form.deposit.checked   = true
    },
    submit(event) {
        event.preventDefault()

        try {
            Form.validateFields()                                          // Verifica campos
            const transaction = Form.formatValues()                        // Formata valores
            const monthIndex = Form.getDataByTransaction(transaction.date) // Pega mês da transação
            Form.saveTransaction(transaction, monthIndex)                  // Adiciona valores
            Form.clearFields()                                             // Limpa campos

            CreateTransactionModal.close()                                                  // Fecha modal
        } catch (error) {
            console.warn(error.message)
            toastError(error.message)
            //alert(error.message)
        }
    }
}
const UpdateTransactionForm = {
    category:    document.querySelector("select#update-category"),
    description: document.querySelector("input#update-description"),
    amount:      document.querySelector("input#update-amount"),
    date:        document.querySelector("input#update-date"),
    deposit:     document.querySelector("input#update-deposit"),
    getValues() {
        return {
            category:    UpdateTransactionForm.category.value,
            description: UpdateTransactionForm.description.value,
            amount:      UpdateTransactionForm.amount.value,
            date:        UpdateTransactionForm.date.value,
            deposit:     UpdateTransactionForm.deposit.checked
        }
    },
    validateFields() {
        const {category, description, amount, date} = UpdateTransactionForm.getValues()

        if (category === '-1' || description.trim() === "" || amount.trim() === "" || date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos!")
        }
    },
    formatValues() {
        let {category, description, amount, date, deposit} = UpdateTransactionForm.getValues()

        amount = Utils.formatAmount(amount)
        date   = Utils.formatDate(date)

        return {
            category,
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
const CreateCategoryForm = {
    category: document.querySelector("input#create-category"),
    getValues() {
        return {
            category: CreateCategoryForm.category.value
        }
    },
    validateFields() {
        let {category} = CreateCategoryForm.getValues()

        if (category.trim() === "") {
            throw new Error("Por favor, preencha o campo!")
        }

        category = String(category).toLowerCase()

        let categories = Storage.getCategories()
        if (categories.includes(category)) {
            throw new Error("Esta categoria já existe, por favor preencha o campo com um valor diferente!")
        }
    },
    formatValues() {
        let {category} = CreateCategoryForm.getValues()

        category = String(category).toLowerCase()

        return category
    },
    saveCategory(category) {
        Storage.updateCategory(category)
    },
    clearFields() {
        CreateCategoryForm.category.value = ""
    },
    submit(event) {
        event.preventDefault()

        try {
            CreateCategoryForm.validateFields()                    // Verifica campos
            const category = CreateCategoryForm.formatValues()     // Formata valores
            CreateCategoryForm.saveCategory(category)              // Adiciona valores
            CreateCategoryForm.clearFields()                       // Limpa campos

            CategoryModal.close()                            // Fecha modal
        } catch (error) {
            console.warn(error.message)
            toastError(error.message)
        }
    }

}
const DeleteCategoryForm = {
    category: document.querySelector("input#delete-category"),
    getValues() {
        return {
            category: DeleteCategoryForm.category.value
        }
    },
    validateFields() {
        let {category} = DeleteCategoryForm.getValues()

        if (category.trim() === "") {
            throw new Error("Por favor, preencha o campo!")
        }

        category = String(category).toLowerCase()

        let categories = Storage.getCategories()
        if (!categories.includes(category)) {
            throw new Error("Esta categoria não existe, por favor preencha o campo com um valor diferente!")
        }
    },
    formatValues() {
        let {category} = DeleteCategoryForm.getValues()

        category = String(category).toLowerCase()

        return category
    },
    saveCategory(category) {
        Storage.setCategory(category)
    },
    clearFields() {
        DeleteCategoryForm.category.value = ""
    },
    submit(event) {
        event.preventDefault()

        try {
            DeleteCategoryForm.validateFields()                    // Verifica campos
            const category = DeleteCategoryForm.formatValues()     // Formata valores
            DeleteCategoryForm.saveCategory(category)              // Adiciona valores
            DeleteCategoryForm.clearFields()                       // Limpa campos

            CategoryModal.close()                                  // Fecha modal
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