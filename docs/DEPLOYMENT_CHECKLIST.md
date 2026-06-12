# Deployment Checklist - Vercel + Stripe + Supabase

## Status Current

| Task | Status | Notes |
|------|--------|-------|
| Vercel project created | ✅ | Project name: `u-finf` |
| Build passes | ✅ | Exit code 0 |
| Domains added (ufinf.com, www.ufinf.com) | ✅ | Awaiting DNS propagation |
| DNS records configured | ✅ | CNAME, TXT records in Cloudflare |
| DNS propagation | ⏳ | In progress (5-60 minutes typical) |
| Environment variables | ⏳ | In progress - See ENV_VARIABLES_SETUP.md |
| Supabase schema | ✅ | 9 tables created and initialized |
| Stripe integration | ⏳ | Pending webhook configuration |

---

## 🎯 Next Immediate Steps (This Session)

### 1. Generate & Add Environment Variables
```bash
# Generate secrets
node ai_growth_os/generate-secrets.js

# Copy output and add to Vercel:
# Settings → Environment Variables → Add Environment Variable
```

**Variables to add:**
- [ ] `ADMIN_EMAIL` → `admin@ufinf.com`
- [ ] `ADMIN_PASSWORD` → bcrypt hash (generate in step 1)
- [ ] `ADMIN_SESSION_SECRET` → from generate-secrets.js output
- [ ] `ADMIN_TOTP_SECRET` → from generate-secrets.js output
- [ ] `STRIPE_SECRET_KEY` → sk_test_... from Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` → placeholder for now (will update after webhook setup)

**Stripe Dashboard → Developers → API Keys:**
```
Copy: Secret Key (sk_test_...)
Paste to Vercel: STRIPE_SECRET_KEY
```

### 2. Monitor DNS Propagation

Check Vercel domains page every ~5 minutes:
```
https://vercel.com/minonenkis-projects/u-finf/settings/domains
```

Expected progression:
```
ufinf.com: "Waiting for DNS Propagation" → "Valid Configuration" ✅
www.ufinf.com: "Waiting for DNS Propagation" → "Valid Configuration" ✅
```

When both show "Valid Configuration":
- Domain is fully operational
- SSL certificate automatically issued by Vercel
- Site accessible at https://ufinf.com

### 3. Trigger New Vercel Deployment

Once DNS is valid, trigger rebuild with env vars:
```bash
git push origin main
# OR manually in Vercel: Deployments → Redeploy
```

Verify build succeeds and check logs for env var confirmation.

### 4. Test Production Site

Once deployment succeeds:
```
https://ufinf.com/               # Landing page
https://ufinf.com/admin-panel    # Admin login (test with ADMIN_EMAIL + ADMIN_PASSWORD)
```

---

## ⏸️ Waiting On (Don't Forget!)

### DNS Propagation
- **What:** Global DNS servers updating with Cloudflare records
- **Status:** In progress (CNAME for ufinf.com, TXT for verification, CNAME for www)
- **Typical time:** 5-60 minutes
- **Monitor:** Vercel domains page

### Domain Status Expected
After DNS propagates:
```
ufinf.com: Valid Configuration ✅ (CNAME to Vercel)
www.ufinf.com: Valid Configuration ✅ (CNAME to Vercel)
```

---

## 🔐 Stripe Webhook Setup (After DNS Valid)

Once domain is fully operational:

### Step 1: Configure Webhook Endpoint in Stripe
1. Go to **Stripe Dashboard → Developers → Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://ufinf.com/api/stripe/webhook`
4. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click **Add endpoint**

### Step 2: Copy Webhook Secret
1. In Stripe Dashboard, find your new endpoint
2. Click to view details
3. Copy **Signing secret** (whsec_...)
4. In Vercel environment variables:
   - Key: `STRIPE_WEBHOOK_SECRET`
   - Value: `whsec_...` (paste from Stripe)
   - Sensitive: Yes
   - Environments: Production and Preview
5. Save and redeploy

### Step 3: Test Webhook
1. In Stripe webhook details, find **Signing secret**
2. Click **Send test event**
3. Select `checkout.session.completed`
4. Click **Send event**
5. Check endpoint response - should show 200 OK

---

## 🧪 Payment Flow Testing (After Everything Configured)

### Test Mode (use sk_test_* keys):

1. **Test Top-Up Purchase**
   - Visit: `https://ufinf.com`
   - Click "Get Credits"
   - Select: "25 Credits - $9" (or any package)
   - Use test card: `4242 4242 4242 4242`
   - Expiry: any future date
   - CVC: any 3 digits
   - Verify:
     - Stripe shows completed charge
     - Supabase `top_up_purchases` table has record
     - User balance updated

2. **Test Subscription**
   - Visit: `https://ufinf.com`
   - Click "Subscribe"
   - Select: "Pro - $24/month" (or Premium Plus)
   - Use test card (same as above)
   - Verify:
     - Stripe shows active subscription
     - Supabase `subscription_entitlements` has record
     - User tier updated

3. **Test Webhook Delivery**
   - In Stripe Dashboard, check webhook events
   - All events should show successful (200 OK) delivery
   - Check app logs for any errors

### Switch to Live Mode (Production):
- Replace `sk_test_*` with `sk_live_*` keys
- Replace `whsec_test_*` with `whsec_live_*` keys
- Update Stripe webhook URL if different
- Test with real payment method (or Stripe test mode with live keys)

---

## 📋 Final Verification Checklist

Before declaring "production ready":

### Domain & HTTPS
- [ ] `https://ufinf.com` loads successfully
- [ ] `https://www.ufinf.com` redirects to `ufinf.com`
- [ ] SSL certificate issued (browser shows 🔒)
- [ ] No CORS errors in console

### Admin Panel
- [ ] Admin login works (ADMIN_EMAIL + ADMIN_PASSWORD)
- [ ] 2FA TOTP works (ADMIN_TOTP_SECRET)
- [ ] Session persists across page reloads
- [ ] Logout works

### Stripe Integration
- [ ] Test charge completes
- [ ] Webhook delivery succeeds (200 OK in Stripe)
- [ ] Data persists in Supabase (`top_up_purchases`, `stripe_fulfilled_sessions`)

### Database (Supabase)
- [ ] Can query tables via SQL Editor
- [ ] RLS policies prevent unauthorized access
- [ ] Indexes on frequently queried columns (already set up)

### Monitoring
- [ ] Vercel deployment logs look clean (no errors)
- [ ] No 5xx errors in Vercel logs
- [ ] Stripe webhook logs show successful delivery
- [ ] Supabase shows normal query performance

---

## 🚨 Troubleshooting Quick Reference

| Issue | Check | Fix |
|-------|-------|-----|
| "Domain not found" | DNS status in Vercel | Wait for propagation or check Cloudflare DNS |
| "ADMIN_PASSWORD rejected" | Verify bcrypt hash | Regenerate: `node -e "console.log(require('bcryptjs').hashSync('password', 10))"` |
| Stripe charge fails | STRIPE_SECRET_KEY | Verify key format (sk_test_* or sk_live_*) |
| Webhook 401/403 error | STRIPE_WEBHOOK_SECRET | Check it's the signing secret, not API key |
| "Environment variable not found" | Vercel env vars list | Verify exact spelling and Environment selection |
| Build fails | Check Vercel logs | Look for missing env vars or code errors |

---

## 📞 Documentation References

- **Complete env var setup:** See [docs/ENV_VARIABLES_SETUP.md](./ENV_VARIABLES_SETUP.md)
- **Vercel + Cloudflare guide:** See [docs/VERCEL_CLOUDFLARE_DEPLOY.md](./VERCEL_CLOUDFLARE_DEPLOY.md)
- **Supabase schema:** See [docs/SUPABASE_INIT.sql](./SUPABASE_INIT.sql)
- **Supabase verification:** See [docs/SUPABASE_QUICK_START.md](./SUPABASE_QUICK_START.md)
- **Generate secrets script:** `node generate-secrets.js`

---

## 🎯 Success Criteria

✅ **Deployment is successful when:**
1. `https://ufinf.com` loads without errors
2. Admin can login with test credentials
3. Test payment processes successfully
4. Data appears in Supabase tables
5. Stripe webhook delivers events

**Estimated time from here:**
- DNS propagation: 5-60 minutes
- Env var setup: 5-10 minutes
- Stripe webhook setup: 5-10 minutes
- Testing: 10-20 minutes
- **Total: ~1 hour from now**

---

## 📅 Last Updated

Created during deployment session on June 11, 2026.
Use this as reference for post-deployment verification.
