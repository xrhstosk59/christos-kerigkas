// src/lib/auth/access-control.ts

/**
 * Δικαιώματα που μπορούν να ανατεθούν σε ρόλους.
 */
export enum Permission {
    // Δικαιώματα προφίλ
    READ_PROFILE = 'read:profile',
    UPDATE_PROFILE = 'update:profile',
    
    // Δικαιώματα χρηστών
    READ_USERS = 'read:users',
    CREATE_USERS = 'create:users',
    UPDATE_USERS = 'update:users',
    DELETE_USERS = 'delete:users',
    
    // Δικαιώματα διαχείρισης
    ACCESS_ADMIN = 'access:admin',
    VIEW_ANALYTICS = 'view:analytics',
    VIEW_LOGS = 'view:logs',
    
    // Δικαιώματα για projects
    READ_PROJECTS = 'read:projects',
    WRITE_PROJECTS = 'write:projects',
    DELETE_PROJECTS = 'delete:projects',
    
    // Δικαιώματα για certifications
    READ_CERTIFICATIONS = 'read:certifications',
    WRITE_CERTIFICATIONS = 'write:certifications',
    DELETE_CERTIFICATIONS = 'delete:certifications',
    
    // Δικαιώματα για αρχεία
    UPLOAD_FILES = 'upload:files',
    DELETE_FILES = 'delete:files',
  }
  
  /**
   * Ρόλοι χρηστών στην εφαρμογή.
   */
  export enum Role {
    ADMIN = 'admin',
    EDITOR = 'editor',
    USER = 'user',
    GUEST = 'guest',
  }
  
  /**
   * Αντιστοίχιση ρόλων με δικαιώματα.
   */
  const rolePermissions: Record<Role, Permission[]> = {
    [Role.ADMIN]: [
      // Ο διαχειριστής έχει όλα τα δικαιώματα
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.READ_USERS,
      Permission.CREATE_USERS,
      Permission.UPDATE_USERS,
      Permission.DELETE_USERS,
      Permission.ACCESS_ADMIN,
      Permission.VIEW_ANALYTICS,
      Permission.VIEW_LOGS,
      Permission.READ_PROJECTS,
      Permission.WRITE_PROJECTS,
      Permission.DELETE_PROJECTS,
      Permission.READ_CERTIFICATIONS,
      Permission.WRITE_CERTIFICATIONS,
      Permission.DELETE_CERTIFICATIONS,
      Permission.UPLOAD_FILES,
      Permission.DELETE_FILES,
    ],
    
    [Role.EDITOR]: [
      // Ο συντάκτης μπορεί να διαχειριστεί περιεχόμενο
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.READ_PROJECTS,
      Permission.WRITE_PROJECTS,
      Permission.READ_CERTIFICATIONS,
      Permission.WRITE_CERTIFICATIONS,
      Permission.UPLOAD_FILES,
    ],
    
    [Role.USER]: [
      // Ο απλός χρήστης έχει βασική πρόσβαση ανάγνωσης
      Permission.READ_PROFILE,
      Permission.UPDATE_PROFILE,
      Permission.READ_PROJECTS,
      Permission.READ_CERTIFICATIONS,
    ],
    
    [Role.GUEST]: [
      // Ο επισκέπτης έχει μόνο δικαιώματα ανάγνωσης δημόσιου περιεχομένου
      Permission.READ_PROJECTS,
      Permission.READ_CERTIFICATIONS,
    ],
  };
  
  /**
   * Έλεγχος αν ένας ρόλος έχει ένα συγκεκριμένο δικαίωμα.
   * 
   * @param role Ο ρόλος του χρήστη
   * @param permission Το δικαίωμα που ελέγχεται
   * @returns Αν ο ρόλος έχει το δικαίωμα
   */
  export function hasPermission(role: Role, permission: Permission): boolean {
    return rolePermissions[role]?.includes(permission) || false;
  }
  
  /**
   * Έλεγχος αν ένας ρόλος έχει όλα τα δικαιώματα από μια λίστα.
   * 
   * @param role Ο ρόλος του χρήστη
   * @param permissions Λίστα δικαιωμάτων που ελέγχονται
   * @returns Αν ο ρόλος έχει όλα τα δικαιώματα
   */
  export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every(permission => hasPermission(role, permission));
  }
  
  /**
   * Έλεγχος αν ένας ρόλος έχει τουλάχιστον ένα από τα δικαιώματα σε μια λίστα.
   * 
   * @param role Ο ρόλος του χρήστη
   * @param permissions Λίστα δικαιωμάτων που ελέγχονται
   * @returns Αν ο ρόλος έχει τουλάχιστον ένα από τα δικαιώματα
   */
  export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some(permission => hasPermission(role, permission));
  }
  
  /**
   * Επιστρέφει όλα τα δικαιώματα που έχει ένας ρόλος.
   * 
   * @param role Ο ρόλος του χρήστη
   * @returns Λίστα με όλα τα δικαιώματα του ρόλου
   */
  export function getRolePermissions(role: Role): Permission[] {
    return [...(rolePermissions[role] || [])];
  }
  
  /**
   * Τύπος που αναπαριστά το βασικό προφίλ χρήστη με ρόλο.
   */
  export interface UserWithRole {
    id: string;
    email: string;
    role: Role;
  }
  
  /**
   * Middleware για έλεγχο δικαιωμάτων.
   * 
   * @param user Ο χρήστης με το ρόλο του
   * @param requiredPermission Το απαιτούμενο δικαίωμα
   * @returns Αν ο χρήστης έχει πρόσβαση
   */
  export function checkPermission(
    user: UserWithRole | null, 
    requiredPermission: Permission
  ): boolean {
    if (!user) {
      return false;
    }
    
    return hasPermission(user.role, requiredPermission);
  }
  
  /**
   * Έλεγχος αν ο τρέχον χρήστης είναι διαχειριστής.
   * 
   * @param user Ο χρήστης με το ρόλο του
   * @returns Αν ο χρήστης είναι διαχειριστής
   */
  export function isAdmin(user: UserWithRole | null): boolean {
    return user?.role === Role.ADMIN;
  }
  
  /**
   * Έλεγχος αν ο τρέχον χρήστης είναι τουλάχιστον συντάκτης.
   * 
   * @param user Ο χρήστης με το ρόλο του
   * @returns Αν ο χρήστης είναι τουλάχιστον συντάκτης
   */
  export function isAtLeastEditor(user: UserWithRole | null): boolean {
    if (!user) return false;
    return [Role.ADMIN, Role.EDITOR].includes(user.role);
  }