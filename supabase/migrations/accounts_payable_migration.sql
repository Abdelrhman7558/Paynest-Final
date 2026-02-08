-- =====================================================
-- ACCOUNTS PAYABLE DATABASE SCHEMA
-- Finance-Grade, Multi-tenant, Audit-safe
-- =====================================================

-- 1. VENDORS TABLE
-- Master table for vendor/supplier information
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  tax_number TEXT,
  default_currency TEXT DEFAULT 'EGP',
  payment_terms_days INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Indexes for vendors
CREATE INDEX IF NOT EXISTS idx_vendors_workspace_id ON vendors(workspace_id);
CREATE INDEX IF NOT EXISTS idx_vendors_name ON vendors(name);
CREATE INDEX IF NOT EXISTS idx_vendors_is_active ON vendors(is_active);

-- Enable RLS
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors
CREATE POLICY "Users can view vendors in their workspace"
  ON vendors FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert vendors in their workspace"
  ON vendors FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update vendors in their workspace"
  ON vendors FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
  ));

-- 2. VENDOR INVOICES TABLE
-- Invoice tracking with status, amounts, due dates
CREATE TABLE IF NOT EXISTS vendor_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  invoice_number TEXT NOT NULL,
  invoice_date DATE NOT NULL,
  due_date DATE,
  
  subtotal NUMERIC(14,2) NOT NULL,
  tax_amount NUMERIC(14,2) DEFAULT 0,
  discount_amount NUMERIC(14,2) DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL,
  
  currency TEXT NOT NULL DEFAULT 'EGP',
  
  paid_amount NUMERIC(14,2) DEFAULT 0,
  outstanding_amount NUMERIC(14,2) NOT NULL,
  
  status TEXT CHECK (status IN (
    'draft',
    'pending',
    'partially_paid',
    'paid',
    'overdue',
    'cancelled'
  )) DEFAULT 'pending',
  
  source TEXT CHECK (source IN (
    'manual',
    'upload',
    'api'
  )) DEFAULT 'manual',
  
  file_url TEXT,
  parsed_by_ai BOOLEAN DEFAULT FALSE,
  
  notes TEXT,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE,
  
  UNIQUE (workspace_id, vendor_id, invoice_number)
);

-- Indexes for vendor_invoices
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_workspace_id ON vendor_invoices(workspace_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_vendor_id ON vendor_invoices(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_status ON vendor_invoices(status);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_due_date ON vendor_invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_vendor_invoices_invoice_date ON vendor_invoices(invoice_date);

-- Enable RLS
ALTER TABLE vendor_invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_invoices
CREATE POLICY "Users can view invoices in their workspace"
  ON vendor_invoices FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert invoices in their workspace"
  ON vendor_invoices FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update invoices in their workspace"
  ON vendor_invoices FOR UPDATE
  USING (workspace_id IN (
    SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
  ));

-- 3. VENDOR INVOICE ITEMS TABLE
-- Line items for each invoice
CREATE TABLE IF NOT EXISTS vendor_invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES vendor_invoices(id) ON DELETE CASCADE,
  
  product_name TEXT,
  description TEXT,
  
  quantity NUMERIC(10,2),
  unit_cost NUMERIC(14,2),
  line_total NUMERIC(14,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vendor_invoice_items
CREATE INDEX IF NOT EXISTS idx_vendor_invoice_items_invoice_id ON vendor_invoice_items(invoice_id);

-- Enable RLS
ALTER TABLE vendor_invoice_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies (inherit from parent invoice)
CREATE POLICY "Users can view invoice items for their invoices"
  ON vendor_invoice_items FOR SELECT
  USING (invoice_id IN (
    SELECT id FROM vendor_invoices WHERE workspace_id IN (
      SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
    )
  ));

CREATE POLICY "Users can insert invoice items for their invoices"
  ON vendor_invoice_items FOR INSERT
  WITH CHECK (invoice_id IN (
    SELECT id FROM vendor_invoices WHERE workspace_id IN (
      SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
    )
  ));

-- 4. VENDOR PAYMENTS TABLE
-- Payment history linked to invoices
CREATE TABLE IF NOT EXISTS vendor_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID NOT NULL,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES vendor_invoices(id) ON DELETE SET NULL,
  
  payment_date DATE NOT NULL,
  amount NUMERIC(14,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  payment_method TEXT,
  
  reference_number TEXT,
  notes TEXT,
  
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for vendor_payments
CREATE INDEX IF NOT EXISTS idx_vendor_payments_workspace_id ON vendor_payments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_vendor_id ON vendor_payments(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_invoice_id ON vendor_payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_vendor_payments_payment_date ON vendor_payments(payment_date);

-- Enable RLS
ALTER TABLE vendor_payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendor_payments
CREATE POLICY "Users can view payments in their workspace"
  ON vendor_payments FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert payments in their workspace"
  ON vendor_payments FOR INSERT
  WITH CHECK (workspace_id IN (
    SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
  ));

-- 5. AUDIT LOGS TABLE
-- Full audit trail for all changes
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id UUID,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  action TEXT NOT NULL,
  performed_by UUID,
  previous_data JSONB,
  new_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for audit_logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_workspace_id ON audit_logs(workspace_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for audit_logs (read-only for users)
CREATE POLICY "Users can view audit logs in their workspace"
  ON audit_logs FOR SELECT
  USING (workspace_id IN (
    SELECT workspace_id FROM user_masareefy WHERE user_id = auth.uid()
  ));

-- Allow insert for audit logging
CREATE POLICY "Allow audit log insertion"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- TRIGGERS AND FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ap_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for vendors updated_at
CREATE TRIGGER update_vendors_timestamp
  BEFORE UPDATE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_ap_updated_at();

-- Trigger for vendor_invoices updated_at
CREATE TRIGGER update_vendor_invoices_timestamp
  BEFORE UPDATE ON vendor_invoices
  FOR EACH ROW
  EXECUTE FUNCTION update_ap_updated_at();

-- Function to auto-update invoice status based on payments
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS TRIGGER AS $$
DECLARE
  invoice_record RECORD;
BEGIN
  -- Get the invoice details
  SELECT total_amount, paid_amount, due_date INTO invoice_record
  FROM vendor_invoices WHERE id = NEW.invoice_id;
  
  -- Update paid_amount
  UPDATE vendor_invoices 
  SET paid_amount = paid_amount + NEW.amount,
      outstanding_amount = total_amount - (paid_amount + NEW.amount),
      status = CASE 
        WHEN (paid_amount + NEW.amount) >= total_amount THEN 'paid'
        WHEN (paid_amount + NEW.amount) > 0 THEN 'partially_paid'
        ELSE status
      END
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update invoice when payment is recorded
CREATE TRIGGER after_payment_insert
  AFTER INSERT ON vendor_payments
  FOR EACH ROW
  WHEN (NEW.invoice_id IS NOT NULL)
  EXECUTE FUNCTION update_invoice_status();

-- Function to check and update overdue invoices (to be run as scheduled job)
CREATE OR REPLACE FUNCTION update_overdue_invoices()
RETURNS void AS $$
BEGIN
  UPDATE vendor_invoices
  SET status = 'overdue'
  WHERE status IN ('pending', 'partially_paid')
    AND due_date < CURRENT_DATE
    AND outstanding_amount > 0;
END;
$$ LANGUAGE plpgsql;
