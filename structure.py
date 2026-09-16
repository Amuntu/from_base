import os
from pathlib import Path

# Define the complete file structure relative to the project root
structure = [
    # root level files
    ".gitignore",
    "AGENTS.md",
    "CLAUDE.md",
    "components.json",
    "eslint.config.js",
    "index.html",
    "jsconfig.json",
    "package.json",
    "postcss.config.js",
    "README.md",
    "tailwind.config.js",
    "vite.config.js",
    
    # src/api
    "src/api/base44Client.js",
    
    # src/components/agents
    "src/components/agents/AgentCard.jsx",
    "src/components/agents/AgentGraph.jsx",
    "src/components/agents/NodeInspector.jsx",
    "src/components/agents/RunLog.jsx",
    
    # src/components/analytics
    "src/components/analytics/MarketingPanel.jsx",
    "src/components/analytics/RevenuePanel.jsx",
    
    # src/components/copilot
    "src/components/copilot/ChatInput.jsx",
    "src/components/copilot/MessageBubble.jsx",
    
    # src/components/layout
    "src/components/layout/Sidebar.jsx",
    
    # src/components/purchase
    "src/components/purchase/PackageCard.jsx",
    
    # src/components/reveal
    "src/components/reveal/ZoneGated.jsx",
    "src/components/reveal/ZoneOtp.jsx",
    "src/components/reveal/ZonePublic.jsx",
    
    # src/components/rfq
    "src/components/rfq/BroadcastPanel.jsx",
    "src/components/rfq/RFQFilters.jsx",
    "src/components/rfq/RFQStatusBadge.jsx",
    "src/components/rfq/RFQTable.jsx",
    
    # src/components/settings
    "src/components/settings/AIModelForm.jsx",
    "src/components/settings/ChannelsForm.jsx",
    "src/components/settings/ConnectionCard.jsx",
    "src/components/settings/DatabaseForm.jsx",
    "src/components/settings/MappingCard.jsx",
    "src/components/settings/SettingsForm.jsx",
    
    # src/components/suppliers
    "src/components/suppliers/SupplierForm.jsx",
    "src/components/suppliers/SupplierTable.jsx",
    
    # src/components/ui
    "src/components/ui/accordion.jsx",
    "src/components/ui/alert-dialog.jsx",
    "src/components/ui/alert.jsx",
    "src/components/ui/aspect-ratio.jsx",
    "src/components/ui/avatar.jsx",
    "src/components/ui/badge.jsx",
    "src/components/ui/breadcrumb.jsx",
    "src/components/ui/button.jsx",
    "src/components/ui/calendar.jsx",
    "src/components/ui/card.jsx",
    "src/components/ui/carousel.jsx",
    "src/components/ui/chart.jsx",
    "src/components/ui/checkbox.jsx",
    "src/components/ui/collapsible.jsx",
    "src/components/ui/command.jsx",
    "src/components/ui/context-menu.jsx",
    "src/components/ui/dialog.jsx",
    "src/components/ui/drawer.jsx",
    "src/components/ui/dropdown-menu.jsx",
    "src/components/ui/form.jsx",
    "src/components/ui/hover-card.jsx",
    "src/components/ui/image-helpers.js",
    "src/components/ui/image.jsx",
    "src/components/ui/input-otp.jsx",
    "src/components/ui/input.jsx",
    "src/components/ui/label.jsx",
    "src/components/ui/menubar.jsx",
    "src/components/ui/navigation-menu.jsx",
    "src/components/ui/pagination.jsx",
    "src/components/ui/popover.jsx",
    "src/components/ui/progress.jsx",
    "src/components/ui/radio-group.jsx",
    "src/components/ui/resizable.jsx",
    "src/components/ui/responsive-image.jsx",
    "src/components/ui/scroll-area.jsx",
    "src/components/ui/select.jsx",
    "src/components/ui/separator.jsx",
    "src/components/ui/sheet.jsx",
    "src/components/ui/sidebar.jsx",
    "src/components/ui/skeleton.jsx",
    "src/components/ui/slider.jsx",
    "src/components/ui/sonner.jsx",
    "src/components/ui/switch.jsx",
    "src/components/ui/table.jsx",
    "src/components/ui/tabs.jsx",
    "src/components/ui/textarea.jsx",
    "src/components/ui/toast.jsx",
    "src/components/ui/toaster.jsx",
    "src/components/ui/toggle-group.jsx",
    "src/components/ui/toggle.jsx",
    "src/components/ui/tooltip.jsx",
    "src/components/ui/use-responsive-image.jsx",
    "src/components/ui/use-toast.jsx",
    
    # src/components root level components
    "src/components/AuthLayout.jsx",
    "src/components/GoogleIcon.jsx",
    "src/components/Layout.jsx",
    "src/components/ProtectedRoute.jsx",
    "src/components/ScrollToTop.jsx",
    "src/components/UserNotRegisteredError.jsx",
    
    # src/hooks
    "src/hooks/use-mobile.jsx",
    "src/hooks/use-size.jsx",
    
    # src/lib
    "src/lib/app-params.js",
    "src/lib/AuthContext.jsx",
    "src/lib/authReturnTo.js",
    "src/lib/entityFields.js",
    "src/lib/PageNotFound.jsx",
    "src/lib/query-client.js",
    "src/lib/utils.js",
    
    # src/pages
    "src/pages/Agents.jsx",
    "src/pages/Analytics.jsx",
    "src/pages/Copilot.jsx",
    "src/pages/Dashboard.jsx",
    "src/pages/FollowUps.jsx",
    "src/pages/ForgotPassword.jsx",
    "src/pages/Login.jsx",
    "src/pages/OAuthConsent.jsx",
    "src/pages/Purchase.jsx",
    "src/pages/Register.jsx",
    "src/pages/ResetPassword.jsx",
    "src/pages/RFQDetail.jsx",
    "src/pages/Settings.jsx",
    "src/pages/SubmitRFQ.jsx",
    "src/pages/SupplierReveal.jsx",
    "src/pages/Suppliers.jsx",
    
    # src/utils
    "src/utils/index.ts",
    
    # src root level files
    "src/App.jsx",
    "src/index.css",
    "src/main.jsx",
]

def create_files():
    for file_path_str in structure:
        file_path = Path(file_path_str)
        # Create parent directories if they don't exist
        file_path.parent.mkdir(parents=True, exist_ok=True)
        # Create empty file if it doesn't exist
        if not file_path.exists():
            file_path.touch()
            print(f"Created: {file_path}")
        else:
            print(f"Already exists: {file_path}")

if __name__ == "__main__":
    create_files()
    print("\n✅ File structure creation complete!")