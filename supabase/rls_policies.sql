-- Family Calendar - RLS Policies
-- Exécuter dans l'éditeur SQL de Supabase

-- ============================================
-- FAMILIES
-- ============================================

-- Lecture : visible si membre actif ou super-admin
CREATE POLICY "families_select_policy" ON families
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM family_members 
      WHERE family_members.family_id = families.id 
      AND family_members.user_id = auth.uid() 
      AND family_members.status = 'active'
    ) 
    OR 
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super-admin'
    )
  );

-- Insertion : authentifié
CREATE POLICY "families_insert_policy" ON families
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Modification : admin ou super-admin
CREATE POLICY "families_update_policy" ON families
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.family_id = families.id 
      AND user_roles.user_id = auth.uid() 
      AND (user_roles.role = 'admin' OR user_roles.role = 'super-admin')
    )
  );

-- Suppression : admin ou super-admin
CREATE POLICY "families_delete_policy" ON families
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.family_id = families.id 
      AND user_roles.user_id = auth.uid() 
      AND (user_roles.role = 'admin' OR user_roles.role = 'super-admin')
    )
  );

-- ============================================
-- FAMILY MEMBERS
-- ============================================

-- Lecture : si membre de la famille
CREATE POLICY "family_members_select_policy" ON family_members
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super-admin'
    )
  );

-- Insertion : authentifié
CREATE POLICY "family_members_insert_policy" ON family_members
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- USER ROLES
-- ============================================

-- Lecture : ses propres rôles ou super-admin
CREATE POLICY "user_roles_select_policy" ON user_roles
  FOR SELECT USING (
    user_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM user_roles AS ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'super-admin'
    )
  );

-- Insertion : authentifié
CREATE POLICY "user_roles_insert_policy" ON user_roles
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================
-- EVENTS
-- ============================================

-- Lecture : si membre de la famille ou super-admin
CREATE POLICY "events_select_policy" ON events
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'super-admin'
    )
  );

-- Insertion : si membre actif
CREATE POLICY "events_insert_policy" ON events
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND status = 'active'
    )
  );

-- Modification : owner, admin ou super-admin
CREATE POLICY "events_update_policy" ON events
  FOR UPDATE USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.family_id = events.family_id 
      AND user_roles.user_id = auth.uid() 
      AND (user_roles.role = 'admin' OR user_roles.role = 'super-admin')
    )
  );

-- Suppression : owner, admin ou super-admin
CREATE POLICY "events_delete_policy" ON events
  FOR DELETE USING (
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.family_id = events.family_id 
      AND user_roles.user_id = auth.uid() 
      AND (user_roles.role = 'admin' OR user_roles.role = 'super-admin')
    )
  );

-- ============================================
-- EVENT GUESTS
-- ============================================

-- Lecture : si accès à l'événement
CREATE POLICY "event_guests_select_policy" ON event_guests
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events 
      WHERE family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Insertion/Modification/Suppression : si peut modifier l'événement
CREATE POLICY "event_guests_insert_policy" ON event_guests
  FOR INSERT WITH CHECK (
    event_id IN (
      SELECT id FROM events WHERE created_by = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.family_id = (SELECT family_id FROM events WHERE id = event_guests.event_id)
      AND user_roles.user_id = auth.uid()
      AND (user_roles.role = 'admin' OR user_roles.role = 'super-admin')
    )
  );

-- ============================================
-- EVENT HISTORY
-- ============================================

-- Lecture : si accès à l'événement
CREATE POLICY "event_history_select_policy" ON event_history
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events 
      WHERE family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- ============================================
-- EVENT COMMENTS
-- ============================================

-- Lecture : si accès à l'événement
CREATE POLICY "event_comments_select_policy" ON event_comments
  FOR SELECT USING (
    event_id IN (
      SELECT id FROM events 
      WHERE family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Insertion : si membre actif
CREATE POLICY "event_comments_insert_policy" ON event_comments
  FOR INSERT WITH CHECK (
    event_id IN (
      SELECT id FROM events 
      WHERE family_id IN (
        SELECT family_id FROM family_members 
        WHERE user_id = auth.uid() AND status = 'active'
      )
    )
  );

-- Modification/Suppression : owner ou admin
CREATE POLICY "event_comments_update_policy" ON event_comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "event_comments_delete_policy" ON event_comments
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- NOTIFICATIONS
-- ============================================

-- Lecture : uniquement ses propres notifications
CREATE POLICY "notifications_select_policy" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Insertion : authentifié (généralement via API)
CREATE POLICY "notifications_insert_policy" ON notifications
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Modification : uniquement ses propres notifications
CREATE POLICY "notifications_update_policy" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- Suppression : uniquement ses propres notifications
CREATE POLICY "notifications_delete_policy" ON notifications
  FOR DELETE USING (user_id = auth.uid());

-- ============================================
-- INVITATIONS
-- ============================================

-- Lecture : si admin de la famille ou invitation destinée à l'utilisateur
CREATE POLICY "invitations_select_policy" ON invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.family_id = invitations.family_id 
      AND user_roles.user_id = auth.uid()
      AND (user_roles.role = 'admin' OR user_roles.role = 'super-admin')
    )
    OR
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.email = invitations.email
    )
  );

-- Insertion : si peut inviter
CREATE POLICY "invitations_insert_policy" ON invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.family_id = invitations.family_id 
      AND user_roles.user_id = auth.uid()
      AND (user_roles.role = 'admin' OR user_roles.role = 'super-admin')
    )
  );

-- ============================================
-- ACTIVER REALTIME
-- ============================================

-- Activer la réplication pour les tables importantes
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
