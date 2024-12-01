const app = Vue.createApp({
    data() {
        return {
            isDarkMode: localStorage.getItem('darkMode') === 'true',
            currentLang: localStorage.getItem('lang') || 'en',
            newTask: '',
            tasks: JSON.parse(localStorage.getItem('tasks')) || [],
            currentFilter: 'all',
            showDeleteModal: false,
            translations: {
                en: {
                    title: 'Todo List',
                    addTaskPlaceholder: 'Add a new task...',
                    all: 'All',
                    active: 'Active',
                    completed: 'Completed',
                    itemsLeft: 'items left',
                    clearCompleted: 'Clear completed',
                    noTasks: 'No tasks to show',
                    confirmDelete: 'Delete Completed Tasks',
                    deleteWarning: 'This action cannot be undone.',
                    confirm: 'Confirm',
                    cancel: 'Cancel'
                },
                ar: {
                    title: 'قائمة المهام',
                    addTaskPlaceholder: 'أضف مهمة جديدة...',
                    all: 'الكل',
                    active: 'النشطة',
                    completed: 'المكتملة',
                    itemsLeft: 'مهام متبقية',
                    clearCompleted: 'حذف المكتمل',
                    noTasks: 'لا توجد مهام',
                    confirmDelete: 'حذف المهام المكتملة',
                    deleteWarning: 'لا يمكن التراجع عن هذا الإجراء.',
                    confirm: 'تأكيد',
                    cancel: 'إلغاء'
                }
            },
            filters: [
                { value: 'all', label: 'all' },
                { value: 'active', label: 'active' },
                { value: 'completed', label: 'completed' }
            ],
            drag: false
        }
    },
    computed: {
        isArabic() {
            return this.currentLang === 'ar';
        },
        today() {
            const date = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', options);
        },
        filteredTasks: {
            get() {
                switch (this.currentFilter) {
                    case 'active':
                        return this.tasks.filter(task => !task.completed);
                    case 'completed':
                        return this.tasks.filter(task => task.completed);
                    default:
                        return this.tasks;
                }
            },
            set(value) {
                this.tasks = value;
                this.saveTasks();
            }
        },
        activeTasksCount() {
            return this.tasks.filter(task => !task.completed).length;
        },
        completedTasksCount() {
            return this.tasks.filter(task => task.completed).length;
        }
    },
    methods: {
        toggleTheme() {
            this.isDarkMode = !this.isDarkMode;
            localStorage.setItem('darkMode', this.isDarkMode);
            this.createParticles(event, this.isDarkMode ? 'appear' : 'disappear');
        },
        toggleLang() {
            this.currentLang = this.currentLang === 'en' ? 'ar' : 'en';
            localStorage.setItem('lang', this.currentLang);
        },
        addTask() {
            if (this.newTask.trim()) {
                const task = {
                    id: Date.now(),
                    text: this.newTask.trim(),
                    completed: false,
                    time: new Date().toLocaleTimeString(this.currentLang === 'ar' ? 'ar-EG' : 'en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    editing: false,
                    originalText: ''
                };
                
                this.tasks.unshift(task);
                this.newTask = '';
                this.saveTasks();
                this.createParticles(event, 'appear');
            }
        },
        updateTask(task) {
            this.saveTasks();
        },
        startEditing(task) {
            task.originalText = task.text;
            task.editing = true;
            this.$nextTick(() => {
                this.$refs.editInput[0].focus();
            });
        },
        finishEditing(task) {
            if (task.editing) {
                task.text = task.text.trim() || task.originalText;
                task.editing = false;
                this.saveTasks();
            }
        },
        cancelEditing(task) {
            task.text = task.originalText;
            task.editing = false;
        },
        confirmDelete(task) {
            const index = this.tasks.indexOf(task);
            if (index > -1) {
                this.createParticles(event, 'disappear');
                setTimeout(() => {
                    this.tasks.splice(index, 1);
                    this.saveTasks();
                }, 300);
            }
        },
        clearCompleted() {
            this.createParticles(event, 'disappear');
            setTimeout(() => {
                this.tasks = this.tasks.filter(task => !task.completed);
                this.saveTasks();
                this.showDeleteModal = false;
            }, 300);
        },
        saveTasks() {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        },
        createParticles(event, type) {
            const numParticles = 10;
            const particles = [];
            
            for (let i = 0; i < numParticles; i++) {
                const particle = document.createElement('div');
                particle.className = `particle ${type}`;
                
                const size = Math.random() * 8 + 4;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                
                const rect = event.target.getBoundingClientRect();
                const x = event.clientX || (rect.left + rect.width / 2);
                const y = event.clientY || (rect.top + rect.height / 2);
                
                particle.style.left = `${x}px`;
                particle.style.top = `${y}px`;
                
                const angle = (Math.random() * 360 * Math.PI) / 180;
                const velocity = Math.random() * 100 + 50;
                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                
                particle.style.transform = `translate(${vx}px, ${vy}px)`;
                
                document.body.appendChild(particle);
                particles.push(particle);
                
                setTimeout(() => {
                    particle.remove();
                }, 1000);
            }
        }
    },
    watch: {
        isDarkMode: {
            immediate: true,
            handler(newVal) {
                if (newVal) {
                    document.body.classList.add('dark-mode');
                } else {
                    document.body.classList.remove('dark-mode');
                }
            }
        }
    },
    mounted() {
        if (this.isDarkMode) {
            document.body.classList.add('dark-mode');
        }
    }
});

app.mount('#app');
