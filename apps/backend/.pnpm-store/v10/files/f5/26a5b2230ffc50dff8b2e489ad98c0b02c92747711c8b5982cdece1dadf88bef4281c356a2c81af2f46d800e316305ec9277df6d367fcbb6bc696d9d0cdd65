import { buildQuery } from './queries/buildQuery.js';
import { buildSortParam } from './queries/buildSortParam.js';
import { getCollection } from './utilities/getEntity.js';
import { getSession } from './utilities/getSession.js';
import { handleError } from './utilities/handleError.js';
import { transform } from './utilities/transform.js';
export const updateJobs = async function updateMany({ id, data, limit, req, returning, sort: sortArg, where: whereArg }) {
    if (!data?.log?.length) {
        delete data.log;
    }
    const where = id ? {
        id: {
            equals: id
        }
    } : whereArg;
    const { collectionConfig, Model } = getCollection({
        adapter: this,
        collectionSlug: 'payload-jobs'
    });
    const sort = buildSortParam({
        adapter: this,
        config: this.payload.config,
        fields: collectionConfig.flattenedFields,
        sort: sortArg || collectionConfig.defaultSort,
        timestamps: true
    });
    const options = {
        lean: true,
        new: true,
        session: await getSession(this, req)
    };
    let query = await buildQuery({
        adapter: this,
        collectionSlug: collectionConfig.slug,
        fields: collectionConfig.flattenedFields,
        where
    });
    transform({
        adapter: this,
        data,
        fields: collectionConfig.fields,
        operation: 'write'
    });
    let result = [];
    try {
        if (id) {
            if (returning === false) {
                await Model.updateOne(query, data, options);
                return null;
            } else {
                const doc = await Model.findOneAndUpdate(query, data, options);
                result = doc ? [
                    doc
                ] : [];
            }
        } else {
            if (typeof limit === 'number' && limit > 0) {
                const documentsToUpdate = await Model.find(query, {}, {
                    ...options,
                    limit,
                    projection: {
                        _id: 1
                    },
                    sort
                });
                if (documentsToUpdate.length === 0) {
                    return null;
                }
                query = {
                    _id: {
                        $in: documentsToUpdate.map((doc)=>doc._id)
                    }
                };
            }
            await Model.updateMany(query, data, options);
            if (returning === false) {
                return null;
            }
            result = await Model.find(query, {}, {
                ...options,
                sort
            });
        }
    } catch (error) {
        handleError({
            collection: collectionConfig.slug,
            error,
            req
        });
    }
    transform({
        adapter: this,
        data: result,
        fields: collectionConfig.fields,
        operation: 'read'
    });
    return result;
};

//# sourceMappingURL=updateJobs.js.map