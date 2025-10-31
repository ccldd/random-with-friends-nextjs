/**
 * Performance monitoring for Success Criteria metrics
 * 
 * Success Criteria to track:
 * - SC-001: 95% of users can create/join within 10 seconds
 * - SC-002: Participant list updates within 2 seconds (95% of events)
 * - SC-003: 99% join success rate with valid room IDs
 * - SC-004: Host identification at a glance (100%)
 * - SC-005: Room closure message delivery (100%)
 * - SC-006: Host promotion notification within 2 seconds (95% of events)
 */

// Performance mark keys
export const PERFORMANCE_MARKS = {
  // Room creation flow (SC-001)
  CREATE_ROOM_START: 'create-room-start',
  CREATE_ROOM_FORM_SUBMIT: 'create-room-form-submit',
  CREATE_ROOM_API_COMPLETE: 'create-room-api-complete',
  CREATE_ROOM_PAGE_LOADED: 'create-room-page-loaded',
  
  // Room joining flow (SC-001)
  JOIN_ROOM_START: 'join-room-start',
  JOIN_ROOM_FORM_SUBMIT: 'join-room-form-submit',
  JOIN_ROOM_API_COMPLETE: 'join-room-api-complete',
  JOIN_ROOM_PAGE_LOADED: 'join-room-page-loaded',
  
  // Participant list updates (SC-002)
  PARTICIPANT_JOIN_EVENT: 'participant-join-event',
  PARTICIPANT_JOIN_UI_UPDATE: 'participant-join-ui-update',
  PARTICIPANT_LEAVE_EVENT: 'participant-leave-event',
  PARTICIPANT_LEAVE_UI_UPDATE: 'participant-leave-ui-update',
  
  // Host promotion (SC-006)
  HOST_DISCONNECT_EVENT: 'host-disconnect-event',
  HOST_PROMOTION_NOTIFICATION: 'host-promotion-notification',
  HOST_PROMOTION_UI_UPDATE: 'host-promotion-ui-update',
  
  // Room closure (SC-005)
  ROOM_CLOSE_ACTION: 'room-close-action',
  ROOM_CLOSE_NOTIFICATION: 'room-close-notification',
} as const;

// Performance measure keys
export const PERFORMANCE_MEASURES = {
  // SC-001: Room creation/joining time
  CREATE_ROOM_TOTAL: 'create-room-total-time',
  CREATE_ROOM_API: 'create-room-api-time',
  CREATE_ROOM_NAVIGATION: 'create-room-navigation-time',
  
  JOIN_ROOM_TOTAL: 'join-room-total-time',
  JOIN_ROOM_API: 'join-room-api-time',
  JOIN_ROOM_NAVIGATION: 'join-room-navigation-time',
  
  // SC-002: Participant list update latency
  PARTICIPANT_JOIN_LATENCY: 'participant-join-latency',
  PARTICIPANT_LEAVE_LATENCY: 'participant-leave-latency',
  
  // SC-006: Host promotion latency
  HOST_PROMOTION_LATENCY: 'host-promotion-latency',
  
  // SC-005: Room closure notification latency
  ROOM_CLOSE_LATENCY: 'room-close-latency',
} as const;

// Success thresholds from spec
export const SUCCESS_THRESHOLDS = {
  CREATE_JOIN_TIME_MS: 10_000, // SC-001: 10 seconds
  PARTICIPANT_UPDATE_MS: 2_000, // SC-002: 2 seconds
  HOST_PROMOTION_MS: 2_000,     // SC-006: 2 seconds
} as const;

// Percentile targets
export const PERCENTILE_TARGETS = {
  CREATE_JOIN_SUCCESS_RATE: 95,      // SC-001: 95% within threshold
  PARTICIPANT_UPDATE_RATE: 95,       // SC-002: 95% within threshold
  VALID_JOIN_SUCCESS_RATE: 99,       // SC-003: 99% success rate
  HOST_VISIBLE_RATE: 100,            // SC-004: 100% host visible
  ROOM_CLOSE_MESSAGE_RATE: 100,     // SC-005: 100% message delivery
  HOST_PROMOTION_RATE: 95,           // SC-006: 95% within threshold
} as const;

/**
 * Mark a performance event
 */
export function markPerformance(key: keyof typeof PERFORMANCE_MARKS): void {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.mark(PERFORMANCE_MARKS[key]);
      
      // Log in development
      if (process.env.NODE_ENV === 'development') {
        console.debug(`[Performance] Marked: ${PERFORMANCE_MARKS[key]}`);
      }
    } catch (error) {
      console.warn('Failed to mark performance:', error);
    }
  }
}

/**
 * Measure performance between two marks
 */
export function measurePerformance(
  measureKey: keyof typeof PERFORMANCE_MEASURES,
  startMark: keyof typeof PERFORMANCE_MARKS,
  endMark: keyof typeof PERFORMANCE_MARKS
): number | null {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      const measureName = PERFORMANCE_MEASURES[measureKey];
      const startMarkName = PERFORMANCE_MARKS[startMark];
      const endMarkName = PERFORMANCE_MARKS[endMark];
      
      performance.measure(measureName, startMarkName, endMarkName);
      
      const entries = performance.getEntriesByName(measureName);
      if (entries.length > 0) {
        const duration = entries[entries.length - 1].duration;
        
        // Log in development
        if (process.env.NODE_ENV === 'development') {
          console.debug(`[Performance] ${measureName}: ${duration.toFixed(2)}ms`);
        }
        
        // Check against thresholds
        checkThreshold(measureKey, duration);
        
        return duration;
      }
    } catch (error) {
      console.warn('Failed to measure performance:', error);
    }
  }
  return null;
}

/**
 * Check if a measurement meets its threshold
 */
function checkThreshold(measureKey: keyof typeof PERFORMANCE_MEASURES, duration: number): void {
  let threshold: number | null = null;
  let successCriteria: string = '';
  
  switch (measureKey) {
    case 'CREATE_ROOM_TOTAL':
    case 'JOIN_ROOM_TOTAL':
      threshold = SUCCESS_THRESHOLDS.CREATE_JOIN_TIME_MS;
      successCriteria = 'SC-001';
      break;
    case 'PARTICIPANT_JOIN_LATENCY':
    case 'PARTICIPANT_LEAVE_LATENCY':
      threshold = SUCCESS_THRESHOLDS.PARTICIPANT_UPDATE_MS;
      successCriteria = 'SC-002';
      break;
    case 'HOST_PROMOTION_LATENCY':
      threshold = SUCCESS_THRESHOLDS.HOST_PROMOTION_MS;
      successCriteria = 'SC-006';
      break;
  }
  
  if (threshold !== null) {
    const status = duration <= threshold ? '✓ PASS' : '✗ FAIL';
    const emoji = duration <= threshold ? '✅' : '⚠️';
    
    console.log(
      `${emoji} ${successCriteria} ${PERFORMANCE_MEASURES[measureKey]}: ${duration.toFixed(2)}ms (threshold: ${threshold}ms) ${status}`
    );
  }
}

/**
 * Get all performance entries for a measure
 */
export function getPerformanceEntries(measureKey: keyof typeof PERFORMANCE_MEASURES): PerformanceEntry[] {
  if (typeof window !== 'undefined' && window.performance) {
    return performance.getEntriesByName(PERFORMANCE_MEASURES[measureKey]);
  }
  return [];
}

/**
 * Calculate percentile from performance measurements
 */
export function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Get performance summary for reporting
 */
export function getPerformanceSummary(): Record<string, any> {
  if (typeof window === 'undefined' || !window.performance) {
    return {};
  }
  
  const summary: Record<string, any> = {};
  
  // Get all measures
  Object.keys(PERFORMANCE_MEASURES).forEach((key) => {
    const measureKey = key as keyof typeof PERFORMANCE_MEASURES;
    const entries = getPerformanceEntries(measureKey);
    
    if (entries.length > 0) {
      const durations = entries.map((e) => e.duration);
      
      summary[PERFORMANCE_MEASURES[measureKey]] = {
        count: durations.length,
        min: Math.min(...durations),
        max: Math.max(...durations),
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        p50: calculatePercentile(durations, 50),
        p95: calculatePercentile(durations, 95),
        p99: calculatePercentile(durations, 99),
      };
    }
  });
  
  return summary;
}

/**
 * Clear all performance marks and measures
 */
export function clearPerformanceData(): void {
  if (typeof window !== 'undefined' && window.performance) {
    try {
      performance.clearMarks();
      performance.clearMeasures();
      console.debug('[Performance] Cleared all marks and measures');
    } catch (error) {
      console.warn('Failed to clear performance data:', error);
    }
  }
}

/**
 * Export performance data (for testing/analysis)
 */
export function exportPerformanceData(): string {
  const summary = getPerformanceSummary();
  return JSON.stringify(summary, null, 2);
}
