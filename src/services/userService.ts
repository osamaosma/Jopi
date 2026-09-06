// ============================================================================
// Jopi User Service (Production Supabase Version with Sugo Gallery & Moments)
// ============================================================================

import { User, BlockedUser, Report, ReportReason, FilterPreferences, UserMoment } from '../types';
import { StorageService, STORAGE_KEYS } from './storageService';
import { supabase } from './supabaseClient';

export class UserService {
  private static currentUserCache: User | null = null;

  static getCurrentUser(): User {
    StorageService.initializeDefaults();
    if (this.currentUserCache) return this.currentUserCache;
    return StorageService.get<User>(STORAGE_KEYS.CURRENT_USER, {} as User);
  }

  static async fetchCurrentUserReal(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    this.currentUserCache = data as User;
    StorageService.set(STORAGE_KEYS.CURRENT_USER, this.currentUserCache);
    return this.currentUserCache;
  }

  static async updateCoinBalanceReal(newBalance: number): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user || !user.id) return false;

    const { error } = await supabase
      .from('profiles')
      .update({ coin_balance: newBalance })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating balance in cloud:', error);
      return false;
    }

    user.coin_balance = newBalance;
    this.currentUserCache = user;
    StorageService.set(STORAGE_KEYS.CURRENT_USER, user);
    return true;
  }

  static updateCurrentUser(updatedFields: Partial<User>): User {
    const current = this.getCurrentUser();
    const updated: User = {
      ...current,
      ...updatedFields,
      updated_at: new Date().toISOString(),
    };
    this.currentUserCache = updated;
    StorageService.set(STORAGE_KEYS.CURRENT_USER, updated);
    return updated;
  }

  // --- تحديث كافة بيانات الملف الشخصي في السحابة ---
  static async updateLogProfile(
    newName: string, 
    newBio: string, 
    newCity: string, 
    newCountry: string, 
    newJobTitle: string, 
    newPhotoUrl: string
  ): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user || !user.id) return false;

    const updatedData = {
      display_name: newName,
      bio: newBio,
      city: newCity,
      country: newCountry,
      job_title: newJobTitle,
      profile_photo: newPhotoUrl,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('profiles')
      .update(updatedData)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile in cloud:', error);
      return false;
    }

    this.updateCurrentUser(updatedData);
    return true;
  }

  // --- رفع صورة الملف الشخصي من ملفات الهاتف أو المعرض إلى سحابة Supabase Storage ---
  static async uploadAndSetProfilePhoto(file: File): Promise<string | null> {
    const user = this.getCurrentUser();
    if (!user || !user.id) return null;

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('profiles')
      .upload(filePath, file);

    if (uploadError) {
      console.error('Error uploading profile image:', uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('profiles')
      .getPublicUrl(filePath);

    const publicUrl = publicUrlData.publicUrl;

    await this.updateLogProfile(
      user.display_name, 
      user.bio || '', 
      user.city || '', 
      user.country || '', 
      user.job_title || '', 
      publicUrl
    );

    return publicUrl;
  }

  // --- Sugo-Style Gallery (Up to 9 Photos) & Moments Integration ---
  static async updateGalleryPhotos(photos: string[]): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user || !user.id) return false;

    const limitedPhotos = photos.slice(0, 9);

    const { error } = await supabase
      .from('profiles')
      .update({ gallery_photos: limitedPhotos })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating gallery photos:', error);
      return false;
    }

    this.updateCurrentUser({ gallery_photos: limitedPhotos });
    return true;
  }

  static async getUserMoments(userId: string): Promise<UserMoment[]> {
    const { data, error } = await supabase
      .from('user_moments')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user moments:', error);
      return [];
    }

    return data as UserMoment[];
  }

  static async createMoment(content: string, mediaUrls: string[] = []): Promise<UserMoment | null> {
    const user = this.getCurrentUser();
    if (!user || !user.id) return null;

    const { data, error } = await supabase
      .from('user_moments')
      .insert({
        user_id: user.id,
        content,
        media_urls: mediaUrls,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating moment:', error);
      return null;
    }

    return data as UserMoment;
  }

  // --- البحث الحقيقي عن المستخدم عبر الـ ID أو Custom ID في السحابة ---
  static async searchUserByCustomId(searchQuery: string): Promise<User | null> {
    const cleanQuery = searchQuery.trim();
    if (!cleanQuery) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`custom_id.eq.${cleanQuery},id.eq.${cleanQuery}`)
      .maybeSingle();

    if (error) {
      console.error('Error searching user by ID:', error);
      return null;
    }

    return data as User | null;
  }

  static getDiscoverableUsers(filters?: FilterPreferences): User[] {
    StorageService.initializeDefaults();
    const currentUser = this.getCurrentUser();
    const allUsers = StorageService.get<User[]>(STORAGE_KEYS.ALL_USERS, []);
    const passes = StorageService.get<string[]>(STORAGE_KEYS.PASSES, []);
    const blockedList = StorageService.get<BlockedUser[]>(STORAGE_KEYS.BLOCKED_USERS, []);
    const blockedIds = new Set(blockedList.map(b => b.blocked_id));

    return allUsers.filter(u => {
      if (u.id === currentUser.id) return false;
      if (u.is_banned) return false;
      if (passes.includes(u.id)) return false;
      if (blockedIds.has(u.id)) return false;

      if (filters) {
        if (filters.gender_preference === 'men' && u.gender !== 'male') return false;
        if (filters.gender_preference === 'women' && u.gender !== 'female') return false;
        if (u.age && (u.age < filters.age_min || u.age > filters.age_max)) return false;
        if (filters.online_only && !u.is_online) return false;
        if (filters.verified_only && !u.is_verified) return false;
        if (filters.country && filters.country !== 'all' && u.country !== filters.country) return false;
        if (filters.selected_interests && filters.selected_interests.length > 0) {
          const hasInterest = filters.selected_interests.some(int => u.interests.includes(int));
          if (!hasInterest) return false;
        }
      }

      return true;
    });
  }

  static getUserById(userId: string): User | undefined {
    const allUsers = StorageService.get<User[]>(STORAGE_KEYS.ALL_USERS, []);
    const currentUser = this.getCurrentUser();
    if (userId === currentUser.id) return currentUser;
    return allUsers.find(u => u.id === userId);
  }

  static blockUser(targetUserId: string): void {
    const currentUser = this.getCurrentUser();
    const blockedList = StorageService.get<BlockedUser[]>(STORAGE_KEYS.BLOCKED_USERS, []);
    const targetUser = this.getUserById(targetUserId);

    if (!blockedList.some(b => b.blocked_id === targetUserId)) {
      blockedList.push({
        id: `block-${Date.now()}`,
        blocker_id: currentUser.id,
        blocked_id: targetUserId,
        user: targetUser,
        created_at: new Date().toISOString(),
      });
      StorageService.set(STORAGE_KEYS.BLOCKED_USERS, blockedList);
    }
  }

  static unblockUser(targetUserId: string): void {
    const blockedList = StorageService.get<BlockedUser[]>(STORAGE_KEYS.BLOCKED_USERS, []);
    const filtered = blockedList.filter(b => b.blocked_id !== targetUserId);
    StorageService.set(STORAGE_KEYS.BLOCKED_USERS, filtered);
  }

  static getBlockedUsers(): BlockedUser[] {
    return StorageService.get<BlockedUser[]>(STORAGE_KEYS.BLOCKED_USERS, []);
  }

  static reportUser(targetUserId: string, reason: ReportReason, description: string): Report {
    const currentUser = this.getCurrentUser();
    const reports = StorageService.get<Report[]>(STORAGE_KEYS.REPORTS, []);
    const targetUser = this.getUserById(targetUserId);

    const newReport: Report = {
      id: `rep-${Date.now()}`,
      reporter_id: currentUser.id,
      reporter_name: currentUser.display_name,
      reported_user_id: targetUserId,
      reported_user: targetUser,
      reason,
      description,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    reports.unshift(newReport);
    StorageService.set(STORAGE_KEYS.REPORTS, reports);
    return newReport;
  }

  static getAllUsersForAdmin(): User[] {
    const allUsers = StorageService.get<User[]>(STORAGE_KEYS.ALL_USERS, []);
    const currentUser = this.getCurrentUser();
    return [currentUser, ...allUsers];
  }

  static toggleUserVerification(userId: string): boolean {
    const currentUser = this.getCurrentUser();
    if (userId === currentUser.id) {
      const updated = { ...currentUser, is_verified: !currentUser.is_verified };
      this.currentUserCache = updated;
      StorageService.set(STORAGE_KEYS.CURRENT_USER, updated);
      return updated.is_verified;
    }

    const allUsers = StorageService.get<User[]>(STORAGE_KEYS.ALL_USERS, []);
    const userIndex = allUsers.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      allUsers[userIndex].is_verified = !allUsers[userIndex].is_verified;
      StorageService.set(STORAGE_KEYS.ALL_USERS, allUsers);
      return allUsers[userIndex].is_verified;
    }
    return false;
  }

  static toggleUserBan(userId: string): boolean {
    const allUsers = StorageService.get<User[]>(STORAGE_KEYS.ALL_USERS, []);
    const userIndex = allUsers.findIndex(u => u.id === userId);
    if (userIndex >= 0) {
      allUsers[userIndex].is_banned = !allUsers[userIndex].is_banned;
      StorageService.set(STORAGE_KEYS.ALL_USERS, allUsers);
      return !!allUsers[userIndex].is_banned;
    }
    return false;
  }
}