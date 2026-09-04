// ============================================================================
// MingleUp Match Service
// Synchronous Local Access + Asynchronous Cloud Sync
// ============================================================================

import { Match, User, Conversation } from '../types';
import { StorageService, STORAGE_KEYS } from './storageService';
import { UserService } from './userService';
import { NotificationService } from './notificationService';
import { socketService } from './socketService';
import { DatabaseService } from './databaseService';
import { supabase } from './supabaseClient';

export interface SwipeResult {
  isMatch: boolean;
  match?: Match;
  user: User;
}

export class MatchService {
  static getMatches(): Match[] {
    StorageService.initializeDefaults();
    const matches = StorageService.get<Match[]>(STORAGE_KEYS.MATCHES, []);
    const blockedList = StorageService.get<{ blocked_id: string }[]>(STORAGE_KEYS.BLOCKED_USERS, []);
    const blockedIds = new Set(blockedList.map(b => b.blocked_id));

    // Cloud background sync
    this.syncRemoteMatches();

    return matches.filter(m => !blockedIds.has(m.user_two_id));
  }

  private static async syncRemoteMatches(): Promise<void> {
    try {
      const currentUser = UserService.getCurrentUser();
      const { data } = await supabase
        .from('matches')
        .select('*')
        .or(`user_one_id.eq.${currentUser.id},user_two_id.eq.${currentUser.id}`);

      if (data && data.length > 0) {
        const remoteMatches: Match[] = [];
        for (const row of data) {
          const targetId = row.user_one_id === currentUser.id ? row.user_two_id : row.user_one_id;
          const targetUser = await DatabaseService.getProfile(targetId) || UserService.getUserById(targetId);
          if (targetUser) {
            remoteMatches.push({
              id: row.id,
              user_one_id: row.user_one_id,
              user_two_id: row.user_two_id,
              matched_user: targetUser,
              status: 'active',
              last_message: '🎉 It’s a Match!',
              last_message_at: row.created_at,
              unread_count: 0,
              created_at: row.created_at,
              updated_at: row.created_at,
            });
          }
        }
        if (remoteMatches.length > 0) {
          StorageService.set(STORAGE_KEYS.MATCHES, remoteMatches);
        }
      }
    } catch {
      // Ignore background sync errors
    }
  }

  static async swipeRight(targetUserId: string, isSuperLike = false): Promise<SwipeResult> {
    const currentUser = UserService.getCurrentUser();
    let targetUser = await DatabaseService.getProfile(targetUserId);
    
    if (!targetUser) {
      targetUser = UserService.getUserById(targetUserId) || null;
    }

    if (!targetUser) {
      throw new Error('User not found');
    }

    // 1. Cloud Save
    DatabaseService.sendLike(currentUser.id, targetUserId, isSuperLike);

    // 2. Real-time Socket
    socketService.sendSwipe(currentUser, targetUserId, isSuperLike);

    // 3. Local Storage
    const likes = StorageService.get<string[]>(STORAGE_KEYS.LIKES, []);
    if (!likes.includes(targetUserId)) {
      likes.push(targetUserId);
      StorageService.set(STORAGE_KEYS.LIKES, likes);
    }

    const isMatch = isSuperLike || Math.random() > 0.4;
    let newMatch: Match | undefined;

    if (isMatch) {
      const matchId = `match-${Date.now()}`;
      const matches = StorageService.get<Match[]>(STORAGE_KEYS.MATCHES, []);
      const existingMatch = matches.find(m => m.user_two_id === targetUserId);

      if (!existingMatch) {
        newMatch = {
          id: matchId,
          user_one_id: currentUser.id,
          user_two_id: targetUserId,
          matched_user: targetUser,
          status: 'active',
          last_message: isSuperLike ? '⭐ Super Liked you!' : '🎉 It’s a Match!',
          last_message_at: new Date().toISOString(),
          unread_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        matches.unshift(newMatch);
        StorageService.set(STORAGE_KEYS.MATCHES, matches);

        const conversations = StorageService.get<Conversation[]>(STORAGE_KEYS.CONVERSATIONS, []);
        if (!conversations.some(c => c.partner.id === targetUserId)) {
          conversations.unshift({
            id: `conv-${targetUserId}`,
            match_id: newMatch.id,
            partner: targetUser,
            unread_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          StorageService.set(STORAGE_KEYS.CONVERSATIONS, conversations);
        }

        NotificationService.addNotification({
          user_id: currentUser.id,
          type: 'new_match',
          title: 'تطابق جديد! 🎉',
          title_ar: 'تطابق جديد! 🎉',
          body: `أنت و${targetUser.display_name} متطابقان الآن!`,
          body_ar: `أنت و${targetUser.display_name} متطابقان الآن!`,
          avatar_url: targetUser.profile_photo,
          reference_id: targetUserId,
        });
      } else {
        newMatch = existingMatch;
      }
    }

    return {
      isMatch,
      match: newMatch,
      user: targetUser,
    };
  }

  static swipeLeft(targetUserId: string): void {
    const passes = StorageService.get<string[]>(STORAGE_KEYS.PASSES, []);
    if (!passes.includes(targetUserId)) {
      passes.push(targetUserId);
      StorageService.set(STORAGE_KEYS.PASSES, passes);
    }
  }

  static undoLastPass(): User | null {
    const passes = StorageService.get<string[]>(STORAGE_KEYS.PASSES, []);
    if (passes.length === 0) return null;
    const lastPassedId = passes.pop();
    StorageService.set(STORAGE_KEYS.PASSES, passes);
    return lastPassedId ? UserService.getUserById(lastPassedId) || null : null;
  }

  static getWhoLikedYou(): User[] {
    const allUsers = StorageService.get<User[]>(STORAGE_KEYS.ALL_USERS, []);
    return allUsers.slice(0, 6);
  }
}