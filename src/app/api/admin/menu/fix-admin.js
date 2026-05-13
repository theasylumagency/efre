const fs = require('fs');
const path = require('path');

function processDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            if (content.includes('requireAdmin')) {
                content = content.replace(/import \{ requireAdmin \} from "@\/lib\/requireAdmin";/, 'import { isAdminAuthenticated } from "@/lib/admin-auth";');
                
                // For GET
                content = content.replace(/if \(!requireAdmin\(req\)\)/g, 'if (!(await isAdminAuthenticated()))');
                
                // For POST/PUT/DELETE
                content = content.replace(/if \(!requireAdmin\(req\)\)/g, 'if (!(await isAdminAuthenticated()))');

                fs.writeFileSync(fullPath, content, 'utf8');
                console.log(`Updated ${fullPath}`);
            }
        }
    }
}

processDir('d:/chero/ga app/efre/src/app/api/admin/menu');
console.log('Done modifying API routes');
