// ============================================
// CATALOG APIs - GET /app/facets
// ============================================
import { getAggregate } from "../../helpers/index.js";


const getFacets = async (req, res) => {
  try {
   
  const facets = await getAggregate("story", [
      {
        $facet: {
          categories: [
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          moods: [
            { $group: { _id: "$mood", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          ageGroups: [
            { $group: { _id: "$ageGroup", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          durations: [
            { $group: { _id: "$duration", count: { $sum: 1 } } },
            { $sort: { _id: 1 } }
          ],
          isPro: [
            { $group: { _id: "$isPro", count: { $sum: 1 } } }
          ]
        }
      }
    ]);

    return res.status(200).send({
      status: 200,
      facets: {
        categories: facets[0].categories.map(c => ({
          value: c._id,
          count: c.count
        })),
        moods: facets[0].moods.map(m => ({
          value: m._id,
          count: m.count
        })),
        ageGroups: facets[0].ageGroups.map(a => ({
          value: a._id,
          count: a.count
        })),
        durations: facets[0].durations.map(d => ({
          value: d._id,
          count: d.count
        })),
        isPro: facets[0].isPro.map(p => ({
          value: p._id,
          count: p.count
        }))
      }
    });

  } catch (error) {
    console.error("Error fetching facets:", error);
    return res.status(400).send({ 
      status: 400, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getFacets ;


