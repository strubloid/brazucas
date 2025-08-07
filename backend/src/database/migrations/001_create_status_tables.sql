-- Status Management System Migration
-- Creates comprehensive status tracking for different content types and contexts

-- 1. Content Types Table
CREATE TABLE content_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'news', 'ads'
    display_name VARCHAR(100) NOT NULL, -- 'Notícias', 'Anúncios'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Status Contexts Table (different screens/workflows)
CREATE TABLE status_contexts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL, -- 'management', 'approval'
    display_name VARCHAR(100) NOT NULL, -- 'Gerenciar', 'Aprovar'
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Status Definitions Table
CREATE TABLE status_definitions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL, -- 'draft', 'pending', 'approved', etc.
    display_name VARCHAR(100) NOT NULL, -- 'Rascunho', 'Pendente', 'Aprovado'
    description TEXT,
    color_background VARCHAR(50),
    color_border VARCHAR(50),
    color_text VARCHAR(50),
    color_header_bg VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Status Context Mappings (which statuses are available in which contexts)
CREATE TABLE status_context_mappings (
    id SERIAL PRIMARY KEY,
    content_type_id INTEGER REFERENCES content_types(id) ON DELETE CASCADE,
    context_id INTEGER REFERENCES status_contexts(id) ON DELETE CASCADE,
    status_id INTEGER REFERENCES status_definitions(id) ON DELETE CASCADE,
    is_default BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_type_id, context_id, status_id)
);

-- 5. Content Status History (audit trail)
CREATE TABLE content_status_history (
    id SERIAL PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content_id INTEGER NOT NULL,
    status_code VARCHAR(50) NOT NULL,
    changed_by INTEGER, -- user_id who made the change
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    metadata JSONB, -- additional context data
    INDEX(content_type, content_id),
    INDEX(status_code),
    INDEX(changed_at)
);

-- Insert default content types
INSERT INTO content_types (name, display_name) VALUES
('news', 'Notícias'),
('ads', 'Anúncios');

-- Insert status contexts
INSERT INTO status_contexts (name, display_name, description) VALUES
('management', 'Gerenciar', 'Contexto para gerenciar conteúdo próprio'),
('approval', 'Aprovar', 'Contexto para aprovar/rejeitar conteúdo de outros'),
('public', 'Público', 'Contexto para visualização pública');

-- Insert status definitions
-- Note: "archived" status has been removed as per system design changes. 
-- Previously archived content should now use "rejected" status instead.
INSERT INTO status_definitions (code, display_name, description, color_background, color_border, color_text, color_header_bg, sort_order) VALUES
-- Draft statuses
('draft', 'Rascunho', 'Conteúdo em elaboração', 'rgba(156, 163, 175, 0.15)', '#9ca3af', '#000000', 'rgba(156, 163, 175, 0.1)', 1),

-- Pending statuses
('pending_approval', 'Aguardando Aprovação', 'Aguardando aprovação administrativa', 'rgba(251, 146, 60, 0.15)', '#fb923c', '#c2410c', 'rgba(251, 146, 60, 0.1)', 2),

-- Approved/Published statuses
('approved', 'Aprovado', 'Conteúdo aprovado mas não publicado', 'rgba(34, 197, 94, 0.15)', '#22c55e', '#166534', 'rgba(34, 197, 94, 0.1)', 4),
('published', 'Publicado', 'Conteúdo público e visível', 'rgba(34, 197, 94, 0.15)', '#22c55e', '#166534', 'rgba(34, 197, 94, 0.1)', 5),

-- Rejected statuses
('rejected', 'Rejeitado', 'Conteúdo rejeitado', 'rgba(239, 68, 68, 0.15)', '#ef4444', '#dc2626', 'rgba(239, 68, 68, 0.1)', 6),

-- Special statuses
('expired', 'Expirado', 'Conteúdo expirado', 'rgba(107, 114, 128, 0.15)', '#6b7280', '#374151', 'rgba(107, 114, 128, 0.1)', 7);

-- Status context mappings for NEWS
-- Management context (for news creators/editors)
INSERT INTO status_context_mappings (content_type_id, context_id, status_id, is_default, is_visible)
SELECT 
    ct.id,
    sc.id,
    sd.id,
    CASE WHEN sd.code = 'draft' THEN true ELSE false END as is_default,
    true
FROM content_types ct
CROSS JOIN status_contexts sc
CROSS JOIN status_definitions sd
WHERE ct.name = 'news' 
  AND sc.name = 'management'
  AND sd.code IN ('draft', 'pending_approval', 'published', 'rejected');

-- Approval context (for admins approving news)
INSERT INTO status_context_mappings (content_type_id, context_id, status_id, is_default, is_visible)
SELECT 
    ct.id,
    sc.id,
    sd.id,
    CASE WHEN sd.code = 'pending_approval' THEN true ELSE false END as is_default,
    true
FROM content_types ct
CROSS JOIN status_contexts sc
CROSS JOIN status_definitions sd
WHERE ct.name = 'news' 
  AND sc.name = 'approval'
  AND sd.code IN ('pending_approval', 'approved', 'rejected');

-- Status context mappings for ADS
-- Management context (for ad creators)
INSERT INTO status_context_mappings (content_type_id, context_id, status_id, is_default, is_visible)
SELECT 
    ct.id,
    sc.id,
    sd.id,
    CASE WHEN sd.code = 'draft' THEN true ELSE false END as is_default,
    true
FROM content_types ct
CROSS JOIN status_contexts sc
CROSS JOIN status_definitions sd
WHERE ct.name = 'ads' 
  AND sc.name = 'management'
  AND sd.code IN ('draft', 'pending_approval', 'approved', 'published', 'rejected', 'expired');

-- Approval context (for admins approving ads)
INSERT INTO status_context_mappings (content_type_id, context_id, status_id, is_default, is_visible)
SELECT 
    ct.id,
    sc.id,
    sd.id,
    CASE WHEN sd.code = 'pending_approval' THEN true ELSE false END as is_default,
    true
FROM content_types ct
CROSS JOIN status_contexts sc
CROSS JOIN status_definitions sd
WHERE ct.name = 'ads' 
  AND sc.name = 'approval'
  AND sd.code IN ('pending_approval', 'approved', 'rejected');

-- Public context (for public viewing)
INSERT INTO status_context_mappings (content_type_id, context_id, status_id, is_default, is_visible)
SELECT 
    ct.id,
    sc.id,
    sd.id,
    false as is_default,
    true
FROM content_types ct
CROSS JOIN status_contexts sc
CROSS JOIN status_definitions sd
WHERE sc.name = 'public'
  AND sd.code IN ('published');
