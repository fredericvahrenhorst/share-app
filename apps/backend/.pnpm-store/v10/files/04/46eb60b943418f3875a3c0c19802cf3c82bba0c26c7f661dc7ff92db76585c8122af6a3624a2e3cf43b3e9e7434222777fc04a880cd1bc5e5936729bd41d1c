import { getGlobal } from './utilities/getEntity.js';
import { getSession } from './utilities/getSession.js';
import { transform } from './utilities/transform.js';
export const createGlobal = async function createGlobal({ slug: globalSlug, data, req, returning }) {
    const { globalConfig, Model } = getGlobal({
        adapter: this,
        globalSlug
    });
    transform({
        adapter: this,
        data,
        fields: globalConfig.fields,
        globalSlug,
        operation: 'write'
    });
    const options = {
        session: await getSession(this, req)
    };
    let [result] = await Model.create([
        data
    ], options);
    if (returning === false) {
        return null;
    }
    result = result.toObject();
    transform({
        adapter: this,
        data: result,
        fields: globalConfig.fields,
        operation: 'read'
    });
    return result;
};

//# sourceMappingURL=createGlobal.js.map