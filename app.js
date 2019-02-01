
// BUDGET CONTROLLER

var budgetController = (function () {
     
    
    var Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentange = -1;
    };
    
   
   
    Expense.prototype.calcPercentange = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentange = Math.round(this.value / totalIncome * 100);
        } else {
            this.percentange = -1;
        }       
    }
    
    Expense.prototype.getPercentange = function() {
        return this.percentange;
    }
    
    var Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }; 
    
    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum += current.value;
        })
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentange: -1
    }
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }                        
            
            // Create item based on 'inc' or 'exp' type
            
            if(type === 'exp' ) {
                newItem = new Expense(ID, des, val);
            } else if(type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            
            
            // Add it to data structure
            data.allItems[type].push(newItem);
            
            // return the new element
            return newItem;
        },
        
        deleteItem: function(type, id) {
            
            var ids, index;
            
            // id = 3;
            
            ids = data.allItems[type].map(function (current) {
                return current.id;                    
            });
            
            index = ids.indexOf(id);
            
            if(index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            
            // Calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');
            
            // Calculate budget: income - expenses;
            data.budget = data.totals.inc - data.totals.exp;
            
            // Calculate the percentange of income that we spent
            if(data.totals.inc > 0) {
                data.percentange = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentange = -1;
            }            
        },  
        
        
        calculatePercentanges: function() {
              
            data.allItems.exp.forEach(function (current) {
               current.calcPercentange(data.totals.inc); 
            });
        },
        
        
        getPercentanges: function () {
            var allPerc = data.allItems.exp.map(function (current) {
                return current.getPercentange();
            });
            return allPerc;
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentange: data.percentange
            };
        },
        
        testing: function() {
            console.log(data);
        }
    };
    
})();


// UI CONTROLLER

var UIController = (function (){
    
    
    var DOMstrings = {        
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentangeLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
        
    };
    
    var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
    };
    
    var formatNumber = function(num, type) {
            
            var numSplit, int, dec, type;
            /*
            + or - before number
            exactly 2 decimal points
            comma separating the thousands
            
            */
            
            num = Math.abs(num);
            num = num.toFixed(2);
            
            numSplit = num.split('.');
            
            int = numSplit[0];
            
            if(int.length > 3) {
                int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,int.length);
            }
            
            
            dec = numSplit[1];
                        
            
            return (type === 'exp' ? '-' : '+') +  ' ' + int + '.' + dec;
    };
    
    return {
        getInput: function() {           
            return {
                 type: document.querySelector(DOMstrings.inputType).value, // inc or exp
                 description: document.querySelector(DOMstrings.inputDescription).value,
                 value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };                      
        },
        
        getDOMstrings: function() {
            return DOMstrings;
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element;
            
            // Create HTML string with placeholder text
            
            if(type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';  
            }
                       
            
            // Replace the placeholder text with some actual data
            
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            // Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorID) {
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function() {
            var fields, fieldsArr;
            
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array) {
                current.value = "";
            })
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
            
            
            if(obj.percentange > 0) {
                document.querySelector(DOMstrings.percentangeLabel).textContent = obj.percentange + '%';
            } else {
                document.querySelector(DOMstrings.percentangeLabel).textContent = '---';
            }
        },
        
        displayPercentange: function(percentanges) {
            
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);
                                            
            nodeListForEach(fields, function(current, index) {
                
                if(percentanges[index] > 0) {
                    current.textContent = percentanges[index] + '%';
                } else {
                    current.textContent = '---';
                }           
            });
        },
        
        displayMonth: function() {
            var now,year,month,months;
            
            now = new Date();
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            
            year = now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;
        },
        
        changedType: function() {
            
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' + 
                DOMstrings.inputDescription + ',' +
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(current) {
                current.classList.toggle('red-focus');            
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        }
                
    };
    
})();


// GLOBAL APP CONTROLLER

var controller = (function(budgetCtrl, UICtrl) {
    
    var setupEventListeners = function() {
        
        var DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if(event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    
    var updateBudget = function() {
        
        // 1. Calculate the budget
        
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        
        var budget = budgetCtrl.getBudget();
        
        // 3. Display the budget on the UI
        
        UICtrl.displayBudget(budget);
        
        console.log(budget);
    }
    
    var updatePercentages = function() {
        
        // 1. Calculate percetange
        
        budgetCtrl.calculatePercentanges();
        
        // 2. Read percentange from the budget controller
        
        var percentanges = budgetCtrl.getPercentanges();
        
        // 3. Display in the UI
        
        UICtrl.displayPercentange(percentanges);

    };
    
    var ctrlAddItem = function() {
        
        var input, newItem;
        
        // 1. Get the field input data
        
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            
            // 2. Add the item to the budget controller
        
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
        
            // 3. Add the item to the UI
        
            UICtrl.addListItem(newItem, input.type);
        
            // 4. Clear the fields
            
            UICtrl.clearFields();
        
            // 5. Calculate and update budget
            
            updateBudget();
            
            // 6. Calculate and update percentange
            updatePercentages();
            
        }                      
    };
    
    var ctrlDeleteItem = function(event) {
        var itemId, splitId, type, id;
      
        itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemId) {
            
            // inc-1
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);
            
            // 1. Delete the item from the data structure
            
            budgetCtrl.deleteItem(type, id);
            
            // 2. Delete item from the UI
            UICtrl.deleteListItem(itemId);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Calculate and update percentange
            updatePercentages();
        }
    };
    
    return {
        init: function() {
            console.log('Application has started');
            UICtrl.displayMonth();           
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentange: 0
            });
            setupEventListeners();
            
            
        }
    };
    
})(budgetController, UIController);


controller.init();