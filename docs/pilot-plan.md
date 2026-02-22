# 2-Week Pilot Plan

## Objective
Validate bidirectional sync between Kanban, Notion, and Gmail with real workloads using a scoped test dataset.

---

## Week 1: Setup & Baseline

### Day 1-2: Infrastructure
- [ ] Create Notion database with properties: `Status`, `Priority`, `Due Date`, `Source`, `Gmail Thread ID`
- [ ] Create Gmail label: `task-inbox`
- [ ] Set up local development environment
- [ ] Configure `.env` with Notion token + Google OAuth credentials

### Day 3-4: Integration
- [ ] Deploy middleware service locally (or to Railway/Render)
- [ ] Register Notion webhooks for `page.created`, `page.updated`
- [ ] Set up Gmail Watch API on `task-inbox` label
- [ ] Verify Kanban ↔ Notion status sync with 3 test tasks

### Day 5-7: Initial Testing
- [ ] Create 10 tasks in Notion; verify all appear in Kanban <5 min
- [ ] Send 5 emails with `[TASK]` prefix to Gmail label; verify card creation
- [ ] Move 3 cards in Kanban; verify Notion status updates
- [ ] Confirm Done status triggers Gmail notification

---

## Week 2: Monitoring & Iteration

### Metrics to Track

| Metric | Target | Measurement Method |
|---|---|---|
| Sync latency | <5 min | Timestamp Notion update vs Kanban render |
| Missed events | <1% | Compare Notion DB count vs Kanban card count |
| Rate limit hits | 0/hour | BullMQ failed job count |
| Task parse accuracy | >98% | Manual review of 20 Gmail-sourced cards |
| Setup time | <30 min | Timed onboarding session |

### Day 8-10: Load & Edge Cases
- [ ] Test with 50+ tasks in Notion
- [ ] Simulate deleted Notion tasks — verify card removal in Kanban
- [ ] Test Gmail labels rename — verify Watch API reconnects
- [ ] Simulate Redis restart — verify queue recovery

### Day 11-14: Optimization
- [ ] Tune polling interval based on missed event rate
- [ ] Add retry visibility in Kanban UI for failed syncs
- [ ] Document all edge cases discovered
- [ ] Create onboarding guide based on setup friction observed

---

## Go/No-Go Criteria

Proceed to full deployment if:
- Sync latency <5 min in 95% of tests
- Zero data loss events
- Setup completed in <30 minutes by a non-technical user
