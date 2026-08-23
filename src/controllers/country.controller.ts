import { Request, Response } from "express";
import { supabase } from "../config/supabase.js";

export const getCountries = async (
  req: Request,
  res: Response
) => {
  try {
    const { data, error } = await supabase
      .from("countries")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      console.error("Get countries error:", error);

      return res.status(500).json({
        message: "Failed to fetch countries",
        error: error.message,
      });
    }

    return res.status(200).json({
      countries: data,
    });
  } catch (error) {
    console.error("Get countries exception:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const createCountry = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, code } = req.body;

    if (!name || !code) {
      return res.status(400).json({
        message: "Country name and code are required",
      });
    }

    const { data, error } = await supabase
      .from("countries")
      .insert({
        name,
        code: code.toUpperCase(),
        status: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Create country error:", error);

      return res.status(500).json({
        message: "Failed to create country",
        error: error.message,
      });
    }

    return res.status(201).json({
      message: "Country created successfully",
      country: data,
    });
  } catch (error) {
    console.error("Create country exception:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const updateCountry = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, code, status } = req.body;

    const { data, error } = await supabase
      .from("countries")
      .update({
        name,
        code: code?.toUpperCase(),
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Update country error:", error);

      return res.status(500).json({
        message: "Failed to update country",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Country updated successfully",
      country: data,
    });
  } catch (error) {
    console.error("Update country exception:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const deleteCountry = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("countries")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete country error:", error);

      return res.status(500).json({
        message: "Failed to delete country",
        error: error.message,
      });
    }

    return res.status(200).json({
      message: "Country deleted successfully",
    });
  } catch (error) {
    console.error("Delete country exception:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};