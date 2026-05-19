/* ============================================================
   CARE PLUS ADMIN - Generic CRUD Engine
   Each page passes a config object to AdminCRUD.init()
   ============================================================ */

var AdminCRUD = {
    config: null,
    editingId: null,
    currentPage: 1,
    pageSize: 20,
    totalCount: 0,

    async init(cfg) {
        this.config = cfg;
        this.currentPage = 1;
        this.pageSize = cfg.pageSize || 20;

        var user = await requireAdmin();
        if (!user) return;

        this.bindSearch();
        this.bindSave();
        this.load();
    },

    async load() {
        var cfg = this.config;
        var tbody = document.getElementById(cfg.tbodyId);
        tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--cp-text-secondary);">Carregando...</td></tr>';

        var searchInput = document.querySelector('.search-input input');
        var search = searchInput ? searchInput.value.trim() : '';

        var offset = (this.currentPage - 1) * this.pageSize;

        var options = {
            select: cfg.select || '*',
            limit: this.pageSize,
            offset: offset,
            order: cfg.order || { column: 'created_at', ascending: false }
        };
        if (search && cfg.searchColumn) {
            options.search = search;
            options.searchColumn = cfg.searchColumn;
        }
        if (cfg.filters) {
            options.filters = cfg.filters;
        }

        var result = await API.list(cfg.table, options);
        var rows = result.data;
        this.totalCount = result.count;

        if (rows.length === 0) {
            tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;color:var(--cp-text-secondary);">Nenhum registro encontrado</td></tr>';
            this.renderPagination();
            return;
        }

        tbody.innerHTML = rows.map(function(row) {
            return cfg.renderRow(row);
        }).join('');

        this.renderPagination();
    },

    renderPagination() {
        var existing = document.getElementById('crud-pagination');
        if (existing) existing.remove();

        var totalPages = Math.ceil(this.totalCount / this.pageSize);
        if (totalPages <= 1) return;

        var self = this;
        var container = document.createElement('div');
        container.id = 'crud-pagination';
        container.className = 'crud-pagination';

        var info = document.createElement('span');
        info.className = 'pagination-info';
        var start = (this.currentPage - 1) * this.pageSize + 1;
        var end = Math.min(this.currentPage * this.pageSize, this.totalCount);
        info.textContent = start + '-' + end + ' de ' + this.totalCount;
        container.appendChild(info);

        var nav = document.createElement('div');
        nav.className = 'pagination-nav';

        var prevBtn = document.createElement('button');
        prevBtn.textContent = 'Anterior';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.onclick = function() { self.currentPage--; self.load(); };
        nav.appendChild(prevBtn);

        var pageInfo = document.createElement('span');
        pageInfo.textContent = this.currentPage + ' / ' + totalPages;
        nav.appendChild(pageInfo);

        var nextBtn = document.createElement('button');
        nextBtn.textContent = 'Proximo';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.onclick = function() { self.currentPage++; self.load(); };
        nav.appendChild(nextBtn);

        container.appendChild(nav);

        var table = document.getElementById(this.config.tbodyId).closest('table') || document.getElementById(this.config.tbodyId).parentElement;
        table.parentElement.insertBefore(container, table.nextSibling);
    },

    bindSearch() {
        var self = this;
        var searchInput = document.querySelector('.search-input input');
        if (!searchInput) return;
        var timeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(function() { self.currentPage = 1; self.load(); }, 300);
        });
    },

    openEdit(id) {
        var cfg = this.config;
        this.editingId = id;
        var modalTitle = document.querySelector('#' + cfg.modalId + ' .modal-header h3');
        if (modalTitle) modalTitle.textContent = 'Editar ' + cfg.entityName;

        // Load data into form
        API.getById(cfg.table, id).then(function(data) {
            if (data && cfg.fillForm) {
                cfg.fillForm(data);
            }
            openModal(cfg.modalId);
        });
    },

    openNew() {
        var cfg = this.config;
        this.editingId = null;
        var modalTitle = document.querySelector('#' + cfg.modalId + ' .modal-header h3');
        if (modalTitle) modalTitle.textContent = 'Novo ' + cfg.entityName;
        if (cfg.clearForm) cfg.clearForm();
        openModal(cfg.modalId);
    },

    bindSave() {
        var self = this;
        var cfg = this.config;
        var saveBtn = document.querySelector('#' + cfg.modalId + ' .btn-primary');
        if (!saveBtn) return;

        saveBtn.onclick = async function() {
            var record = cfg.getFormData();
            if (!record) return;

            var result;
            if (self.editingId) {
                result = await API.update(cfg.table, self.editingId, record);
            } else {
                result = await API.create(cfg.table, record);
            }

            if (result.error) {
                showToast('Erro: ' + result.error.message, 'error');
                return;
            }

            closeModal(cfg.modalId);
            showToast(cfg.entityName + ' salvo com sucesso!', 'success');
            self.editingId = null;
            self.load();
        };
    },

    async remove(id, name) {
        if (!confirmDelete(name)) return;
        var result = await API.remove(this.config.table, id);
        if (result.error) {
            showToast('Erro ao excluir: ' + result.error.message, 'error');
            return;
        }
        showToast('"' + name + '" excluido com sucesso!', 'success');
        this.load();
    }
};
