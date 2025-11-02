// ============================================
// CONSENTS APIs - GET /app/consents
// ============================================

import { find } from "../../helpers/index.js";

const getConsents = async (req, res) => {
  try {
    const id = req.params.id

    const consents = await find("consent",{ userId: id });
    
    return res.status(200).send({
      status: 200,
      consents: consents.map(c => ({
        type: c.type,
        version: c.version,
        acceptedAt: c.acceptedAt,
        jurisdiction: c.jurisdiction
      }))
    });
  } catch (error) {
    console.error("Error fetching consents:", error);
    return res.status(500).send({ 
      status: 500, 
      message: error.message || "An unexpected error occurred."
    });
  }
};

export default getConsents;