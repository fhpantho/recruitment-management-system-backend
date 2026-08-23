import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

// ==========================================
// GET ALL CLIENTS
// ==========================================

export const getClients = async (
  req: Request,
  res: Response
) => {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select(`
        id,
        name,
        code,
        country_id,
        contact_person,
        email,
        phone,
        address,
        description,
        status,
        created_at,
        updated_at,
        countries!clients_country_id_fkey (
          id,
          name,
          code
        )
      `)
      .order("name", { ascending: true });

    if (error) {
      console.error("Get clients error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch clients",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      clients: data,
    });
  } catch (error) {
    console.error("Get clients exception:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// GET SINGLE CLIENT
// ==========================================

export const getClient = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("clients")
      .select(`
        id,
        name,
        code,
        country_id,
        contact_person,
        email,
        phone,
        address,
        description,
        status,
        created_at,
        updated_at,
        countries!clients_country_id_fkey (
          id,
          name,
          code
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Get client error:", error);

      return res.status(404).json({
        success: false,
        message: "Client not found",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      client: data,
    });
  } catch (error) {
    console.error("Get client exception:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// CREATE CLIENT
// ==========================================

export const createClient = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      name,
      code,
      country_id,
      contact_person,
      email,
      phone,
      address,
      description,
    } = req.body;

    // ------------------------------
    // VALIDATION
    // ------------------------------

    if (!name || !code || !country_id) {
      return res.status(400).json({
        success: false,
        message:
          "Client name, code and country are required",
      });
    }

    // ------------------------------
    // CHECK COUNTRY
    // ------------------------------

    const {
      data: country,
      error: countryError,
    } = await supabase
      .from("countries")
      .select("id, name, code, status")
      .eq("id", country_id)
      .single();

    if (countryError || !country) {
      return res.status(400).json({
        success: false,
        message: "Selected country was not found",
      });
    }

    if (!country.status) {
      return res.status(400).json({
        success: false,
        message: "Selected country is inactive",
      });
    }

    // ------------------------------
    // CREATE
    // ------------------------------

    const { data, error } = await supabase
      .from("clients")
      .insert({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        country_id,

        contact_person:
          contact_person?.trim() || null,

        email:
          email?.trim() || null,

        phone:
          phone?.trim() || null,

        address:
          address?.trim() || null,

        description:
          description?.trim() || null,

        status: true,
      })
      .select(`
        id,
        name,
        code,
        country_id,
        contact_person,
        email,
        phone,
        address,
        description,
        status,
        created_at,
        updated_at,
        countries!clients_country_id_fkey (
          id,
          name,
          code
        )
      `)
      .single();

    if (error) {
      console.error("Create client error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to create client",
        error: error.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Client created successfully",
      client: data,
    });
  } catch (error) {
    console.error("Create client exception:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// UPDATE CLIENT
// ==========================================

export const updateClient = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const {
      name,
      code,
      country_id,
      contact_person,
      email,
      phone,
      address,
      description,
      status,
    } = req.body;

    // ------------------------------
    // VALIDATION
    // ------------------------------

    if (!name || !code || !country_id) {
      return res.status(400).json({
        success: false,
        message:
          "Client name, code and country are required",
      });
    }

    // ------------------------------
    // CHECK COUNTRY
    // ------------------------------

    const {
      data: country,
      error: countryError,
    } = await supabase
      .from("countries")
      .select("id, name, code, status")
      .eq("id", country_id)
      .single();

    if (countryError || !country) {
      return res.status(400).json({
        success: false,
        message: "Selected country was not found",
      });
    }

    if (!country.status) {
      return res.status(400).json({
        success: false,
        message: "Selected country is inactive",
      });
    }

    // ------------------------------
    // UPDATE
    // ------------------------------

    const { data, error } = await supabase
      .from("clients")
      .update({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        country_id,

        contact_person:
          contact_person?.trim() || null,

        email:
          email?.trim() || null,

        phone:
          phone?.trim() || null,

        address:
          address?.trim() || null,

        description:
          description?.trim() || null,

        status:
          typeof status === "boolean"
            ? status
            : true,

        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select(`
        id,
        name,
        code,
        country_id,
        contact_person,
        email,
        phone,
        address,
        description,
        status,
        created_at,
        updated_at,
        countries!clients_country_id_fkey (
          id,
          name,
          code
        )
      `)
      .single();

    if (error) {
      console.error("Update client error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update client",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client updated successfully",
      client: data,
    });
  } catch (error) {
    console.error("Update client exception:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// ==========================================
// DELETE CLIENT
// ==========================================

export const deleteClient = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    // ------------------------------
    // CHECK CLIENT
    // ------------------------------

    const {
      data: client,
      error: clientError,
    } = await supabase
      .from("clients")
      .select("id")
      .eq("id", id)
      .single();

    if (clientError || !client) {
      return res.status(404).json({
        success: false,
        message: "Client not found",
      });
    }

    // ------------------------------
    // DELETE
    // ------------------------------

    const { error } = await supabase
      .from("clients")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete client error:", error);

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete client. It may be linked to other records.",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Client deleted successfully",
    });
  } catch (error) {
    console.error("Delete client exception:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};