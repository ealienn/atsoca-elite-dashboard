/**
 * Atsoca Elite Database Local Storage & Reactive State Manager
 */
import { calculateUnitsFromAmount, calculateReferralFee, getEliteLevel } from './matrixEngine.js';

const STORAGE_KEY = 'atsoca_elite_db_v100';

// OPTIONAL: Paste your deployed Google Apps Script Web App URL here to sync with Google Sheets
export const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzHpxPOjDQ6gE1fdorKIA7yw-p4Sg3CGnDu9KDKQ98vn6GPEc4pBxZsk2deYXizpIXnKg/exec';

const INITIAL_MEMBERS = [
  {
    id: '004',
    referralCode: 'ATS-REF-004',
    name: 'Joshua Villafuerte',
    email: 'joshua.villafuerte@atsoca.ph',
    password: '12345',
    role: 'Elite Member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    totalUnits: 0.73,
    monthlyUnits: 0.73,
    pendingFees: 0,
    availableForRelease: 24050,
    releasedFees: 0,
    joinDate: '2025-02-01'
  },
  {
    id: '005',
    referralCode: 'ATS-REF-005',
    name: 'Kent Bryan Lontok',
    email: 'kent.lontok@atsoca.ph',
    password: '12345',
    role: 'Elite Member',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    totalUnits: 5.91,
    monthlyUnits: 5.91,
    pendingFees: 0,
    availableForRelease: 810,
    releasedFees: 0,
    joinDate: '2025-02-10'
  },
  {
    id: '006',
    referralCode: 'ATS-REF-006',
    name: 'CE Box',
    email: 'ce.box@atsoca.ph',
    password: '12345',
    role: 'Elite Member',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    totalUnits: 1.22,
    monthlyUnits: 1.22,
    pendingFees: 0,
    availableForRelease: 810,
    releasedFees: 0,
    joinDate: '2025-03-01'
  },
  {
    id: '007',
    referralCode: 'ATS-REF-007',
    name: 'Charlene Stephanie Hilvano',
    email: 'charlene.hilvano@atsoca.ph',
    password: '12345',
    role: 'Elite Member',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    totalUnits: 0.33,
    monthlyUnits: 0.33,
    pendingFees: 0,
    availableForRelease: 0,
    releasedFees: 0,
    joinDate: '2025-03-10'
  },
  {
    id: '008',
    referralCode: 'ATS-REF-008',
    name: 'Jenelle Mangubat',
    email: 'jenelle.mangubat@atsoca.ph',
    password: '12345',
    role: 'Elite Member',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    totalUnits: 0.67,
    monthlyUnits: 0.67,
    pendingFees: 0,
    availableForRelease: 0,
    releasedFees: 0,
    joinDate: '2025-03-15'
  }
];

const INITIAL_INVITES = [];

const INITIAL_ENROLLMENTS = [];

const INITIAL_RELEASES = [
  {
    id: 'REL-2026-101',
    reqNumber: 'ATS-RF-9041',
    eliteMemberId: 'ELITE-101',
    eliteMemberName: 'Ellaine Joyce',
    amount: 15400,
    dateRequested: '2026-07-15',
    processingStatus: 'Released',
    dateReleased: '2026-07-18',
    disbursementMethod: 'GCash (0917-***-8821)',
    notes: 'Batch #4 Referral Fee Release Processed by Finance'
  },
  {
    id: 'REL-2026-102',
    reqNumber: 'ATS-RF-9088',
    eliteMemberId: 'ELITE-101',
    eliteMemberName: 'Ellaine Joyce',
    amount: 8600,
    dateRequested: '2026-07-24',
    processingStatus: 'Finance Review',
    dateReleased: null,
    disbursementMethod: 'Bank Transfer (BDO - 0048****1192)',
    notes: 'Submitted for July 2nd Half Earnings'
  },
  {
    id: 'REL-2026-103',
    reqNumber: 'ATS-RF-9095',
    eliteMemberId: 'ELITE-101',
    eliteMemberName: 'Ellaine Joyce',
    amount: 22000,
    dateRequested: '2026-07-26',
    processingStatus: 'Submitted',
    dateReleased: null,
    disbursementMethod: 'GCash (0928-***-4410)',
    notes: 'Pending validation by Finance'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'NOTIF-01',
    timestamp: '2026-07-26 14:30',
    type: 'Units Earned',
    title: 'Units Credited!',
    message: 'You earned 1.11 units for Patricia Lim (Globe Telecom Inc.).',
    read: false,
    roleTarget: 'Elite Member',
    memberId: 'ELITE-101'
  },
  {
    id: 'NOTIF-02',
    timestamp: '2026-07-25 09:15',
    type: 'Invite Verified',
    title: 'Invite Verification Confirmed',
    message: 'Engr. Robert Tan (Meralco) has been verified by Administration.',
    read: true,
    roleTarget: 'Elite Member',
    memberId: 'ELITE-101'
  },
  {
    id: 'NOTIF-03',
    timestamp: '2026-07-24 16:45',
    type: 'Referral Fee Available',
    title: 'Referral Fee Computation Ready',
    message: '₱810.00 referral fee is now available for release for Engr. Robert Tan.',
    read: true,
    roleTarget: 'Elite Member',
    memberId: 'ELITE-101'
  }
];

class DBState {
  constructor() {
    this.listeners = [];
    this.activeRole = localStorage.getItem('atsoca_active_role') || 'Elite Member'; // 'Elite Member', 'Elite Manager', 'Finance', 'Administrator'
    this.currentMemberId = localStorage.getItem('atsoca_current_member_id') || 'ELITE-101'; // Default logged-in Elite Member
    this.init();
  }

  init() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.data = {
        members: INITIAL_MEMBERS,
        invites: INITIAL_INVITES,
        enrollments: INITIAL_ENROLLMENTS,
        releases: INITIAL_RELEASES,
        notifications: INITIAL_NOTIFICATIONS,
        logs: [
          { id: 'LOG-1', timestamp: new Date().toLocaleString(), user: 'System', action: 'System Init', module: 'Database', details: 'Initialized ATSOCA Elite Database' }
        ]
      };
      this.save();
    } else {
      try {
        this.data = JSON.parse(raw);
        if (this.data && this.data.members && Array.isArray(this.data.members)) {
          this.data.members.forEach(m => {
            if (!m.password || m.password === '••••••••') {
              m.password = '12345';
            }
          });
        }
      } catch (e) {
        console.error('Failed to parse database state, resetting:', e);
        this.resetDatabase();
      }
    }

    if (GOOGLE_SHEETS_WEB_APP_URL) {
      this.syncGoogleSheets();
      setInterval(() => this.syncGoogleSheets(), 15000);
    }
  }

  async syncGoogleSheets() {
    if (!GOOGLE_SHEETS_WEB_APP_URL) return;
    try {
      const res = await fetch(GOOGLE_SHEETS_WEB_APP_URL);
      if (!res.ok) return;

      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) return;
      const payload = await res.json();
      if (!payload) return;

      let rawItems = [];
      if (Array.isArray(payload)) rawItems = payload;
      else if (payload.data && Array.isArray(payload.data)) rawItems = payload.data;
      else if (payload.members && Array.isArray(payload.members)) rawItems = payload.members;
      else if (payload.invites && Array.isArray(payload.invites)) rawItems = payload.invites;

      if (!rawItems || rawItems.length === 0) return;

      const memberMap = {
        '004': 'Joshua Villafuerte',
        '005': 'Kent Bryan Lontok',
        '006': 'CE Box',
        '007': 'Charlene Stephanie Hilvano',
        '008': 'Jenelle Mangubat'
      };

      const syncedInvites = [];
      const syncedEnrollments = [];

      rawItems.forEach((r, idx) => {
        const isArr = Array.isArray(r);

        // Respondent ID: Column B (row[1])
        const respId = String((isArr ? r[1] : (r.colB || r.respondentId || r.id || r.submissionId)) || '').trim() || `GS-${idx + 1}`;

        // Elite Code / Routing: Column H (row[7]) -> strictly normalized as 3-digit string ("004", "005", "006", "007", "008")
        let rawCode = String((isArr ? r[7] : (r.colH || r.eliteCode || r.code || r.referrerId)) || '').trim();
        let eliteCode = null;

        if (rawCode === '4' || rawCode === '004') eliteCode = '004';
        else if (rawCode === '5' || rawCode === '005') eliteCode = '005';
        else if (rawCode === '6' || rawCode === '006') eliteCode = '006';
        else if (rawCode === '7' || rawCode === '007') eliteCode = '007';
        else if (rawCode === '8' || rawCode === '008') eliteCode = '008';

        if (!eliteCode && (!rawCode || isNaN(rawCode))) {
          const textTarget = (String(r.completeName || '') + ' ' + String(r.participantName || '') + ' ' + String(r.referrerName || '')).toLowerCase();
          if (textTarget.includes('joshua') || textTarget.includes('villafuerte')) eliteCode = '004';
          else if (textTarget.includes('kent') || textTarget.includes('lontok')) eliteCode = '005';
          else if (textTarget.includes('ce box') || textTarget.includes('ce.box')) eliteCode = '006';
          else if (textTarget.includes('charlene') || textTarget.includes('hilvano')) eliteCode = '007';
          else if (textTarget.includes('jenelle') || textTarget.includes('mangubat')) eliteCode = '008';
        }

        if (!eliteCode) return;

        // Enrollment Status: Column C (row[2])
        const enrStatusRaw = String((isArr ? r[2] : (r.colC || r.enrollmentStatus)) || '').trim();
        const enrollmentStatus = enrStatusRaw !== '' ? enrStatusRaw : 'Enrolled';

        // Participant Name: Column M (row[12])
        const partName = String((isArr ? r[12] : (r.colM || r.participantName || r.completeName || r.name)) || `Participant ${idx + 1}`).trim();

        // School / Company: Column O (row[14])
        const schoolComp = String((isArr ? r[14] : (r.colO || r.schoolCompany || r.schoolAttended)) || 'N/A').trim();

        // Course / Program: Column R (row[17])
        const courseRaw = String((isArr ? r[17] : (r.colR || r.course || r.trainingType)) || '').toUpperCase();
        const courseChoice = courseRaw.includes('COSH') ? 'COSH' : 'BOSH';

        // Conditional Fee & Payment Extraction:
        // COSH: Fee = Col U (row[20]), Paid = Col V (row[21]), Balance = Col W (row[22])
        // BOSH: Fee = Col Y (row[24]), Paid = Col Z (row[25]), Balance = Col AA (row[26])
        let fee = 0;
        let paid = 0;
        let bal = 0;

        if (courseChoice === 'COSH') {
          fee = Number(isArr ? r[20] : (r.colU || r.investmentFee || r.fee)) || 5000;
          paid = Number(isArr ? r[21] : (r.colV || r.paymentMade || r.paid)) || 0;
          bal = (isArr ? r[22] !== undefined : r.colW !== undefined) ? Number(isArr ? r[22] : r.colW) : Math.max(0, fee - paid);
        } else {
          fee = Number(isArr ? r[24] : (r.colY || r.investmentFee || r.fee)) || 4500;
          paid = Number(isArr ? r[25] : (r.colZ || r.paymentMade || r.paid)) || 0;
          bal = (isArr ? r[26] !== undefined : r.colAA !== undefined) ? Number(isArr ? r[26] : r.colAA) : Math.max(0, fee - paid);
        }

        // Payment Status: Column AC (row[28])
        const payStatusRaw = String((isArr ? r[28] : (r.colAC || r.paymentStatus)) || '').trim();
        const paymentStatus = payStatusRaw !== '' ? payStatusRaw : (paid >= fee && fee > 0 ? 'Fully Paid' : (paid > 0 ? 'Partial' : 'Unpaid'));

        const dateSub = r.dateSubmitted || (r.submittedAt ? String(r.submittedAt).split('T')[0] : new Date().toISOString().split('T')[0]);

        syncedInvites.push({
          id: respId,
          respondentId: respId,
          eliteCode: eliteCode,
          inviteName: partName,
          participantName: partName,
          schoolCompany: schoolComp,
          trainingType: courseChoice,
          course: courseChoice,
          trainingDate: dateSub,
          dateSubmitted: dateSub,
          referrerId: eliteCode,
          referrerName: memberMap[eliteCode] || `Elite Member ${eliteCode}`,
          verificationStatus: (paymentStatus === 'Fully Paid' || paid > 0) ? 'Verified' : 'Pending',
          enrollmentStatus: enrollmentStatus
        });

        syncedEnrollments.push({
          id: respId,
          respondentId: respId,
          eliteCode: eliteCode,
          participantName: partName,
          schoolCompany: schoolComp,
          trainingType: courseChoice,
          course: courseChoice,
          trainingDate: dateSub,
          isReferred: true,
          referrerId: eliteCode,
          referrerName: memberMap[eliteCode] || `Elite Member ${eliteCode}`,
          investmentFee: fee,
          paymentMade: paid,
          balance: bal,
          paymentStatus: paymentStatus,
          enrollmentStatus: enrollmentStatus,
          unitsEarned: Number((paid / 4500).toFixed(2)),
          verifiedDate: dateSub
        });
      });

      if (syncedInvites.length > 0) {
        const syncedInvIds = new Set(syncedInvites.map(i => i.id));
        this.data.invites = syncedInvites;
        this.data.enrollments = syncedEnrollments;

        if (payload.profiles && typeof payload.profiles === 'object') {
          Object.keys(payload.profiles).forEach(memCode => {
            const member = this.data.members.find(m => m.id === memCode);
            if (member && payload.profiles[memCode]) {
              member.avatar = payload.profiles[memCode];
            }
          });
        }

        this.recalculateMemberUnits();
        this.save();
      }
    } catch (err) {
      console.warn('Google Sheets Live Sync:', err);
    }
  }

  recalculateMemberUnits() {
    if (!this.data || !this.data.members) return;
    this.data.members.forEach(member => {
      const memberEnrollments = (this.data.enrollments || []).filter(e =>
        e.referrerId === member.id ||
        (e.referrerName && e.referrerName.toLowerCase() === member.name.toLowerCase())
      );
      const earnedFromEnrollments = memberEnrollments.reduce((sum, e) => sum + (Number(e.unitsEarned) || 0), 0);
      if (earnedFromEnrollments > 0) {
        member.totalUnits = Number(earnedFromEnrollments.toFixed(2));
        member.monthlyUnits = member.totalUnits;
      }
    });
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => fn(this.data));
  }

  resetDatabase() {
    localStorage.removeItem(STORAGE_KEY);
    this.init();
    this.notify();
  }

  setRole(role, memberId = 'ELITE-101') {
    this.activeRole = role;
    this.currentMemberId = memberId;
    localStorage.setItem('atsoca_active_role', role);
    localStorage.setItem('atsoca_current_member_id', memberId);
    this.notify();
  }

  getCurrentMember() {
    return this.data.members.find(m => m.id === this.currentMemberId) || this.data.members[0];
  }

  addMember(memberData) {
    const newId = `ELITE-${101 + this.data.members.length}`;
    const newMember = {
      id: newId,
      name: memberData.name || 'New Elite Member',
      email: memberData.email || `${memberData.name.toLowerCase().replace(/\s+/g, '.')}@atsoca.ph`,
      password: memberData.password || '12345',
      role: memberData.role || 'Elite Member',
      avatar: memberData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      totalUnits: Number(memberData.totalUnits) || 0,
      monthlyUnits: Number(memberData.monthlyUnits) || 0,
      pendingFees: Number(memberData.pendingFees) || 0,
      availableForRelease: Number(memberData.availableForRelease) || 0,
      releasedFees: Number(memberData.releasedFees) || 0,
      joinDate: new Date().toISOString().split('T')[0]
    };
    this.data.members.push(newMember);
    this.addLog(newMember.name, 'Created Member Profile', 'System Admin', `Added new member profile ${newMember.name} (${newMember.id})`);

    if (GOOGLE_SHEETS_WEB_APP_URL) {
      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'member', ...newMember }),
        mode: 'no-cors'
      }).catch(err => console.warn('POST member to Google Sheets:', err));
    }

    this.save();
    return newMember;
  }

  updateMemberProfile(memberId, profileData) {
    const member = this.data.members.find(m => m.id === memberId);
    if (!member) return null;

    if (profileData.name !== undefined && profileData.name.trim() !== '') member.name = profileData.name.trim();
    if (profileData.email !== undefined && profileData.email.trim() !== '') member.email = profileData.email.trim();
    if (profileData.phone !== undefined) member.phone = profileData.phone.trim();
    if (profileData.avatar !== undefined && profileData.avatar.trim() !== '') member.avatar = profileData.avatar.trim();
    if (profileData.password !== undefined && profileData.password.trim() !== '') {
      member.password = profileData.password.trim();
    }
    if (profileData.gcashNumber !== undefined) member.gcashNumber = profileData.gcashNumber.trim();
    if (profileData.bankName !== undefined) member.bankName = profileData.bankName.trim();
    if (profileData.bankAccountName !== undefined) member.bankAccountName = profileData.bankAccountName.trim();
    if (profileData.bankAccountNumber !== undefined) member.bankAccountNumber = profileData.bankAccountNumber.trim();

    this.addLog(member.name, 'Updated Profile Settings', 'Member Self-Service', `Updated profile settings for ${member.name} (${member.id})`);
    this.save();
    return member;
  }

  getManagementProfile(role = this.activeRole) {
    if (!this.data.managementAccounts) {
      this.data.managementAccounts = {
        'Elite Manager': {
          role: 'Elite Manager',
          name: 'Elite Manager',
          email: 'manager@atsoca.ph',
          phone: '0917-888-1029',
          password: '12345',
          avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
          department: 'Operations & Strategy'
        },
        'Finance': {
          role: 'Finance',
          name: 'Finance',
          email: 'finance@atsoca.ph',
          phone: '0917-888-2045',
          password: '12345',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
          department: 'Finance & Disbursement'
        },
        'Administrator': {
          role: 'Administrator',
          name: 'Administrator',
          email: 'admin@atsoca.ph',
          phone: '0917-888-9900',
          password: '12345',
          avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
          department: 'Executive Management'
        }
      };
      this.save();
    }
    const acc = this.data.managementAccounts[role] || this.data.managementAccounts['Administrator'];
    // Force clean account names if legacy data existed
    if (role === 'Elite Manager' && acc.name !== 'Elite Manager') acc.name = 'Elite Manager';
    if (role === 'Finance' && acc.name !== 'Finance') acc.name = 'Finance';
    if (role === 'Administrator' && acc.name !== 'Administrator') acc.name = 'Administrator';
    return acc;
  }

  updateManagementProfile(role, profileData) {
    const account = this.getManagementProfile(role);
    if (!account) return null;

    if (profileData.name !== undefined && profileData.name.trim() !== '') account.name = profileData.name.trim();
    if (profileData.email !== undefined && profileData.email.trim() !== '') account.email = profileData.email.trim();
    if (profileData.phone !== undefined) account.phone = profileData.phone.trim();
    if (profileData.avatar !== undefined && profileData.avatar.trim() !== '') account.avatar = profileData.avatar.trim();
    if (profileData.password !== undefined && profileData.password.trim() !== '') account.password = profileData.password.trim();
    if (profileData.department !== undefined) account.department = profileData.department.trim();

    this.addLog(account.name, 'Updated Management Profile', role, `Updated account profile for ${role} (${account.name})`);
    this.save();
    return account;
  }

  // --- CRUD METHODS ---

  addInvite(inviteData) {
    const member = this.getCurrentMember();
    const newId = `INV-2026-${String(this.data.invites.length + 1).padStart(3, '0')}`;
    const newInvite = {
      id: newId,
      inviteName: inviteData.inviteName,
      schoolCompany: inviteData.schoolCompany,
      trainingType: inviteData.trainingType,
      trainingDate: inviteData.trainingDate,
      dateSubmitted: new Date().toISOString().split('T')[0],
      referrerId: member.id,
      referrerName: member.name,
      verificationStatus: 'Pending',
      enrollmentStatus: 'Not Enrolled'
    };

    this.data.invites.unshift(newInvite);
    this.addLog(member.name, 'Submitted Invite', 'Invite Monitoring', `Submitted invite for ${inviteData.inviteName}`);
    this.addNotification({
      type: 'Invite Verification',
      title: 'New Invite Submitted',
      message: `${inviteData.inviteName} submitted by ${member.name}. Awaiting validation.`,
      roleTarget: 'Elite Manager'
    });

    if (GOOGLE_SHEETS_WEB_APP_URL) {
      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'submit_invite', payload: newInvite }),
        mode: 'no-cors'
      }).catch(err => console.warn('POST to Google Sheets:', err));
    }

    this.save();
    return newInvite;
  }

  verifyInvite(inviteId, status, enrollmentStatus = null) {
    const invite = this.data.invites.find(i => i.id === inviteId);
    if (!invite) return;

    if (status) invite.verificationStatus = status;
    if (enrollmentStatus) invite.enrollmentStatus = enrollmentStatus;

    if (status === 'Verified') {
      if (!enrollmentStatus) invite.enrollmentStatus = 'Enrolled';

      // Credit stats to referrer member's account
      const member = this.data.members.find(m => m.id === invite.referrerId);
      if (member && !invite.unitsCredited) {
        member.totalUnits = Number(((member.totalUnits || 0) + 1).toFixed(2));
        member.monthlyUnits = Number(((member.monthlyUnits || 0) + 1).toFixed(2));
        member.availableForRelease = (member.availableForRelease || 0) + 810; // 18% of ₱4,500
        invite.unitsCredited = true;
      }

      if (!this.data.enrollments.some(e => e.participantName === invite.inviteName)) {
        const newEnrId = `ENR-${Math.floor(1000 + Math.random() * 9000)}`;
        this.data.enrollments.unshift({
          id: newEnrId,
          participantName: invite.inviteName,
          schoolCompany: invite.schoolCompany,
          trainingType: invite.trainingType,
          trainingDate: invite.trainingDate,
          isReferred: true,
          referrerId: invite.referrerId,
          referrerName: invite.referrerName,
          investmentFee: 4500,
          paymentMade: 4500,
          balance: 0,
          paymentStatus: 'Fully Paid',
          unitsEarned: 1,
          verifiedDate: new Date().toISOString().split('T')[0]
        });
      }
    }

    this.addNotification({
      type: 'Invite Verified',
      title: `Invite ${status}`,
      message: `Invite for ${invite.inviteName} has been marked as ${status}.`,
      roleTarget: 'Elite Member',
      memberId: invite.referrerId
    });

    if (GOOGLE_SHEETS_WEB_APP_URL) {
      fetch(GOOGLE_SHEETS_WEB_APP_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify_invite', payload: invite }),
        mode: 'no-cors'
      }).catch(err => console.warn('POST verification to Google Sheets:', err));
    }

    this.addLog(this.activeRole, 'Verify Invite', 'Invite Monitoring', `Marked ${invite.inviteName} as ${status}`);
    this.save();
    this.notify();
  }

  updateMemberUnitsAndFees(memberId, totalUnits, availableForRelease) {
    const member = this.data.members.find(m => m.id === memberId);
    if (!member) return;

    if (totalUnits !== undefined && !isNaN(totalUnits)) {
      member.totalUnits = Number(Number(totalUnits).toFixed(2));
    }
    if (availableForRelease !== undefined && !isNaN(availableForRelease)) {
      member.availableForRelease = Number(Number(availableForRelease).toFixed(2));
    }

    this.addLog(member.name, 'Adjusted Units & Fees', 'Management Override', `Adjusted total units to ${member.totalUnits} and available fee to ₱${member.availableForRelease}`);
    this.save();
    this.notify();
  }

updateEnrollmentPayment(enrollmentId, paymentAmount, newTotalInvestment = null) {
  const enr = this.data.enrollments.find(e => e.id === enrollmentId);
  if (!enr) return;

  if (newTotalInvestment !== null && !isNaN(newTotalInvestment)) {
    enr.investmentFee = Math.max(0, Number(newTotalInvestment));
  }

  const paid = Math.min(enr.investmentFee, Math.max(0, Number(paymentAmount)));
  enr.paymentMade = paid;
  enr.balance = Math.max(0, enr.investmentFee - paid);

  if (enr.balance === 0 && enr.paymentMade > 0) {
    enr.paymentStatus = 'Fully Paid';
  } else if (enr.paymentMade > 0) {
    enr.paymentStatus = 'Partial';
  } else {
    enr.paymentStatus = 'Unpaid';
  }

  // Recompute units earned for referred participant
  if (enr.isReferred && enr.referrerId) {
    const units = calculateUnitsFromAmount(enr.paymentMade);
    enr.unitsEarned = units;

    // Update Member Total Units
    const member = this.data.members.find(m => m.id === enr.referrerId);
    if (member) {
      // Re-sum all verified payment units for this member
      const memberEnrollments = this.data.enrollments.filter(e => e.referrerId === member.id);
      const totalU = memberEnrollments.reduce((sum, e) => sum + calculateUnitsFromAmount(e.paymentMade), 0);
      member.totalUnits = Number(totalU.toFixed(2));
    }
  }

  this.addLog(this.activeRole, 'Payment Updated', 'Enrollment & Payments', `Updated payment for ${enr.participantName} to ₱${paid}`);
  this.save();
}

addPublicEnrollment(publicData) {
  const newId = `ENR-PUB-${Math.floor(100 + Math.random() * 900)}`;
  const fee = Number(publicData.investmentFee) || 0;
  const paid = Number(publicData.paymentMade) || 0;
  const bal = Math.max(0, fee - paid);

  let status = 'Unpaid';
  if (bal === 0 && paid > 0) status = 'Fully Paid';
  else if (paid > 0) status = 'Partial';

  const newPublicEnr = {
    id: newId,
    participantName: publicData.participantName,
    schoolCompany: publicData.schoolCompany || 'N/A',
    trainingType: publicData.trainingType,
    trainingDate: publicData.trainingDate,
    isReferred: false,
    referrerId: null,
    referrerName: 'Direct Walk-in / Online',
    investmentFee: fee,
    paymentMade: paid,
    balance: bal,
    paymentStatus: status,
    unitsEarned: 0,
    verifiedDate: new Date().toISOString().split('T')[0]
  };

  this.data.enrollments.unshift(newPublicEnr);
  this.addLog(this.activeRole, 'Public Enrollment Added', 'Public Enrollment Monitoring', `Added participant ${publicData.participantName}`);
  this.save();
  return newPublicEnr;
}

submitReleaseRequest(amount, disbursementMethod, notes) {
  const member = this.getCurrentMember();
  const reqNum = `ATS-RF-${Math.floor(1000 + Math.random() * 9000)}`;

  const newReq = {
    id: `REL-2026-${this.data.releases.length + 101}`,
    reqNumber: reqNum,
    eliteMemberId: member.id,
    eliteMemberName: member.name,
    amount: Number(amount),
    dateRequested: new Date().toISOString().split('T')[0],
    processingStatus: 'Submitted',
    dateReleased: null,
    disbursementMethod: disbursementMethod,
    notes: notes || 'Online Referral Fee Release Request'
  };

  this.data.releases.unshift(newReq);

  // Deduct from available, add to pending
  member.availableForRelease = Math.max(0, member.availableForRelease - Number(amount));
  member.pendingFees += Number(amount);

  if (GOOGLE_SHEETS_WEB_APP_URL) {
    fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'request_release', payload: newReq }),
      mode: 'no-cors'
    }).catch(err => console.warn('POST release request to Google Sheets:', err));
  }

  this.addNotification({
    type: 'Referral Fee Release Request',
    title: 'New Release Request',
    message: `${member.name} requested ₱${amount.toLocaleString()} payout via ${disbursementMethod}.`,
    roleTarget: 'Finance'
  });

  this.addLog(member.name, 'Submit Release Request', 'Referral Fee Release', `Requested ₱${amount} via ${disbursementMethod}`);
  this.save();
  return newReq;
}

async syncWithGoogleSheets() {
  if (!GOOGLE_SHEETS_WEB_APP_URL) return;
  try {
    const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL);
    if (!response.ok) return;
    const data = await response.json();
    if (!data) return;

    // Safe parsing for Elite_Members
    if (Array.isArray(data.Elite_Members) && data.Elite_Members.length > 0) {
      data.Elite_Members.forEach(sheetMember => {
        if (!sheetMember || !sheetMember.id) return;
        let local = this.data.members.find(m => m.id === sheetMember.id || (m.email && sheetMember.email && m.email.toLowerCase() === sheetMember.email.toLowerCase()));
        if (local) {
          local.totalUnits = Number(sheetMember.totalUnits || local.totalUnits || 0);
          local.monthlyUnits = Number(sheetMember.monthlyUnits || local.monthlyUnits || 0);
          local.availableForRelease = Number(sheetMember.availableForRelease || local.availableForRelease || 0);
          local.releasedFees = Number(sheetMember.releasedFees || local.releasedFees || 0);
          local.pendingFees = Number(sheetMember.pendingFees || local.pendingFees || 0);
        }
      });
    }

    // Safe parsing for Master_Ledger
    if (Array.isArray(data.Master_Ledger) && data.Master_Ledger.length > 0) {
      data.Master_Ledger.forEach(row => {
        if (!row) return;
        const enrId = row.id || row.Enrollment_ID || `ENR-${Math.floor(1000 + Math.random()*9000)}`;
        let existing = this.data.enrollments.find(e => e.id === enrId || (e.participantName && row.participantName && e.participantName.toLowerCase() === row.participantName.toLowerCase()));
        if (existing) {
          existing.investmentFee = Number(row.investmentFee || row.Investment_Fee || existing.investmentFee || 0);
          existing.paymentMade = Number(row.paymentMade || row.Payment_Made || existing.paymentMade || 0);
          existing.balance = Number(row.balance || row.Outstanding_Balance || existing.balance || 0);
          existing.paymentStatus = row.paymentStatus || row.Payment_Status || existing.paymentStatus || 'Unpaid';
        }
      });
    }

    this.save();
    this.notify();
  } catch (err) {
    console.warn('Google Sheets sync error (offline/no-cors mode fallback active):', err);
  }
}

updateReleaseStatus(releaseId, newStatus, financeNotes = '') {
  const rel = this.data.releases.find(r => r.id === releaseId);
  if (!rel) return;

  const oldStatus = rel.processingStatus;
  rel.processingStatus = newStatus;

  const member = this.data.members.find(m => m.id === rel.eliteMemberId);

  if (newStatus === 'Released' && oldStatus !== 'Released') {
    rel.dateReleased = new Date().toISOString().split('T')[0];
    if (member) {
      member.pendingFees = Math.max(0, member.pendingFees - rel.amount);
      member.releasedFees += rel.amount;
      member.totalEarnings = member.releasedFees + member.availableForRelease;
    }
    this.addNotification({
      type: 'Referral Fee Released',
      title: 'Referral Fee Released!',
      message: `Your release request #${rel.reqNumber} for ₱${rel.amount.toLocaleString()} has been processed and disbursed.`,
      roleTarget: 'Elite Member',
      memberId: rel.eliteMemberId
    });
  } else if (newStatus === 'Rejected' && oldStatus !== 'Rejected') {
    if (member) {
      member.pendingFees = Math.max(0, member.pendingFees - rel.amount);
      member.availableForRelease += rel.amount;
    }
  }

  if (financeNotes) {
    rel.notes = `${rel.notes} | Finance Note: ${financeNotes}`;
  }

  this.addLog(this.activeRole, 'Update Release Status', 'Referral Fee Release', `Changed #${rel.reqNumber} status to ${newStatus}`);
  this.save();
}

addNotification(notif) {
  this.data.notifications.unshift({
    id: `NOTIF-${Date.now()}`,
    timestamp: new Date().toLocaleString('en-US', { hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
    read: false,
    ...notif
  });
}

addLog(user, action, module, details) {
  this.data.logs.unshift({
    id: `LOG-${Date.now()}`,
    timestamp: new Date().toLocaleString(),
    user: user || this.activeRole,
    action,
    module,
    details
  });
}
}

export const db = new DBState();
